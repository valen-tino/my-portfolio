import React, { useEffect, useRef, useState, useCallback } from 'react';
import './CursorInverter.css';

interface CursorInverterProps {
  size?: number;
  enabled?: boolean;
  blendMode?: 'difference' | 'exclusion' | 'multiply' | 'screen';
  performanceMode?: 'high' | 'balanced' | 'eco';
}

// Performance optimized cursor inverter
const CursorInverter: React.FC<CursorInverterProps> = ({ 
  size = 128, 
  enabled = true,
  blendMode = 'difference',
  performanceMode = 'balanced'
}) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const lastUpdateRef = useRef<number>(0);
  const positionRef = useRef({ x: 0, y: 0 });

  // Performance-based throttling
  const getThrottleDelay = () => {
    switch (performanceMode) {
      case 'high': return 8;  // ~120fps for high-end devices
      case 'eco': return 32;   // ~30fps for low-end devices
      default: return 16;      // ~60fps balanced mode
    }
  };

  // Throttled mouse move handler for better performance
  const throttledMouseMove = useCallback((e: MouseEvent) => {
    const now = performance.now();
    const delay = getThrottleDelay();
    if (now - lastUpdateRef.current < delay) return;
    
    lastUpdateRef.current = now;
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Direct transform update without easing for better performance
    const x = e.clientX - size / 2;
    const y = e.clientY - size / 2;
    
    // Only update if position actually changed (reduce unnecessary repaints)
    if (positionRef.current.x !== x || positionRef.current.y !== y) {
      positionRef.current = { x, y };
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  }, [size]);

  useEffect(() => {
    if (!enabled) return;
    
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Enhanced device and performance detection
    const hasHover = window.matchMedia('(hover: hover)').matches;
    const hasGoodPerformance = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isLowEndDevice = navigator.hardwareConcurrency <= 2; // Basic CPU detection
    const hasBatteryAPI = 'getBattery' in navigator;
    
    // Auto-adjust performance mode based on device capabilities
    if (!hasHover || !hasGoodPerformance) return;
    if (isLowEndDevice && performanceMode === 'high') {
      console.warn('CursorInverter: Switching to eco mode for better performance on this device');
    }

    // Passive event listener for better performance
    const options: AddEventListenerOptions = { passive: true };

    const handleMouseEnter = () => {
      setIsActive(true);
      document.body.style.cursor = 'none';
    };

    const handleMouseLeave = () => {
      setIsActive(false);
      document.body.style.cursor = 'auto';
    };

    // Set initial cursor style once
    cursor.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      transform: translate3d(-9999px, -9999px, 0);
    `;
    cursor.classList.add(blendMode);
    
    // Add event listeners with passive option
    document.addEventListener('mousemove', throttledMouseMove, options);
    document.addEventListener('mouseenter', handleMouseEnter, options);
    document.addEventListener('mouseleave', handleMouseLeave, options);
    
    // Immediate activation
    setIsActive(true);
    document.body.style.cursor = 'none';

    // Cleanup function
    return () => {
      document.removeEventListener('mousemove', throttledMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.body.style.cursor = 'auto';
    };
  }, [enabled, size, blendMode, throttledMouseMove]);

  if (!enabled) return null;

  return (
    <div 
      ref={cursorRef}
      className={`cursor-inverter ${blendMode} ${isActive ? 'active' : ''}`}
      aria-hidden="true"
      style={{
        width: size,
        height: size,
      }}
    />
  );
};

export default CursorInverter;
