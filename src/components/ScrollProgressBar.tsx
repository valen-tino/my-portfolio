import React, { useEffect, useState } from 'react';

interface ScrollProgressBarProps {
  /** Optional ref to a specific scrollable container (e.g., desktop split-screen right pane) */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  /** Optional label prefix */
  defaultLabel?: string;
}

const ScrollProgressBar: React.FC<ScrollProgressBarProps> = ({
  scrollContainerRef,
  defaultLabel = 'Reading Case Study'
}) => {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(defaultLabel);

  useEffect(() => {
    let rafId: number | null = null;

    const calculateProgress = () => {
      const container = scrollContainerRef?.current;

      if (container && container.scrollHeight > container.clientHeight) {
        const scrollTop = container.scrollTop;
        const maxScroll = container.scrollHeight - container.clientHeight;
        const pct = maxScroll > 0 ? Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100)) : 0;
        setProgress(pct);

        // Detect active section heading inside container
        const headings = Array.from(
          container.querySelectorAll<HTMLElement>('.portfolio-section-title')
        ).filter((h) => h.offsetParent !== null);
        let currentHeading = defaultLabel;
        const containerTop = container.getBoundingClientRect().top;

        for (const h of headings) {
          const rect = h.getBoundingClientRect();
          if (rect.top - containerTop <= 140) {
            currentHeading = (h.textContent || '').trim() || defaultLabel;
          }
        }
        setActiveSection(currentHeading);
      } else {
        // Fallback to window scroll (Mobile & Tablet layout)
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const pct = maxScroll > 0 ? Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100)) : 0;
        setProgress(pct);

        // Filter only visible section headings so hidden desktop elements don't override tracking
        const headings = Array.from(
          document.querySelectorAll<HTMLElement>('.portfolio-section-title')
        ).filter((h) => h.offsetParent !== null);

        let currentHeading = defaultLabel;
        for (const h of headings) {
          const rect = h.getBoundingClientRect();
          if (rect.top <= 180) {
            currentHeading = (h.textContent || '').trim() || defaultLabel;
          }
        }
        setActiveSection(currentHeading);
      }
    };

    const handleScroll = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(calculateProgress);
    };

    const container = scrollContainerRef?.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // Initial calculation
    calculateProgress();

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [scrollContainerRef, defaultLabel]);

  const roundedProgress = Math.round(progress);

  return (
    <div
      className="sticky top-16 lg:top-0 z-30 bg-base-100/95 backdrop-blur-md border-b border-base-300 py-2.5 px-4 mb-6 rounded-b-xl shadow-sm transition-all"
      data-testid="case-study-progress-bar"
    >
      <div className="flex items-center justify-between text-xs font-medium mb-1.5 gap-2">
        <span
          className="text-base-content/80 truncate font-semibold"
          data-testid="progress-active-section"
        >
          {activeSection}
        </span>
        <span
          className="text-info font-bold shrink-0 tabular-nums"
          data-testid="progress-percentage"
        >
          {roundedProgress}%
        </span>
      </div>
      <div className="w-full h-1.5 bg-base-300 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-info via-blue-500 to-indigo-500 rounded-full transition-all duration-150 ease-out shadow-[0_0_8px_rgba(59,130,246,0.6)]"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={roundedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          data-testid="progress-bar-fill"
        />
      </div>
    </div>
  );
};

export default ScrollProgressBar;

