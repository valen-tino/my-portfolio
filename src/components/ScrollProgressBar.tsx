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
      className="sticky top-4 z-30 mb-6 border-b border-muted-300 bg-paper/95 px-4 py-2.5 backdrop-blur-md transition-all"
      data-testid="case-study-progress-bar"
    >
      <div className="mb-1.5 flex items-center justify-between gap-2 text-xs font-medium">
        <span
          className="truncate font-semibold text-ink"
          data-testid="progress-active-section"
        >
          {activeSection}
        </span>
        <span
          className="shrink-0 font-bold tabular-nums text-brand"
          data-testid="progress-percentage"
        >
          {roundedProgress}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted-200">
        <div
          className="h-full rounded-full bg-brand transition-all duration-150 ease-out"
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

