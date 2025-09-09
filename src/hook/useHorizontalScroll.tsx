import { useEffect, useState, useRef } from 'react';

interface HorizontalScrollContainerProps {
  children: React.ReactNode;
  className?: string;
}

// Calculate dynamic height needed for horizontal scroll
const calcDynamicHeight = (objectWidth: number): number => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return objectWidth - vw + vh + 150; // +150 buffer
};

const HorizontalScrollContainer: React.FC<HorizontalScrollContainerProps> = ({ 
  children, 
  className = '' 
}) => {
  const [dynamicHeight, setDynamicHeight] = useState<number | null>(null);
  const [translateX, setTranslateX] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const objectRef = useRef<HTMLDivElement>(null);

  const handleDynamicHeight = () => {
    if (!objectRef.current) return;
    const objectWidth = objectRef.current.scrollWidth;
    const dynamicHeight = calcDynamicHeight(objectWidth);
    setDynamicHeight(dynamicHeight);
  };

  const applyScrollListener = () => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const offsetTop = -containerRef.current.offsetTop;
      setTranslateX(offsetTop);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  };

  useEffect(() => {
    // Set initial height
    handleDynamicHeight();
    
    // Setup scroll listener
    const cleanup = applyScrollListener();
    
    // Handle resize
    const resizeHandler = () => {
      handleDynamicHeight();
    };
    
    window.addEventListener('resize', resizeHandler);
    
    return () => {
      cleanup();
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  return (
    <div 
      className={`relative w-full ${className}`}
      style={{ height: dynamicHeight ? `${dynamicHeight}px` : 'auto' }}
    >
      <div 
        ref={containerRef}
        className="sticky top-0 h-screen w-full overflow-x-hidden"
      >
        <div 
          ref={objectRef}
          className="absolute h-full will-change-transform"
          style={{ transform: `translateX(${translateX}px)` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default HorizontalScrollContainer;
