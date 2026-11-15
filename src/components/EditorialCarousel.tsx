import { Children, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from './Icons';

export function EditorialCarousel({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const [position, setPosition] = useState({ left: 0, max: 0, visible: 1 });
  const count = Children.count(children);

  useEffect(() => {
    const track = ref.current;
    if (!track) return;
    const update = () => {
      const scrollWidth = track.scrollWidth || 1;
      const clientWidth = track.clientWidth || scrollWidth;
      setPosition({
        left: track.scrollLeft,
        max: Math.max(0, scrollWidth - clientWidth),
        visible: Math.min(1, clientWidth / scrollWidth),
      });
    };
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : undefined;
    observer?.observe(track);
    track.addEventListener('scroll', update, { passive: true });
    update();
    return () => {
      observer?.disconnect();
      track.removeEventListener('scroll', update);
    };
  }, [count]);

  const move = (direction: number) => {
    const track = ref.current;
    if (!track) return;
    const item = track.firstElementChild as HTMLElement | null;
    const reducedMotion =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;
    track.scrollBy?.({
      left: direction * ((item?.offsetWidth ?? track.clientWidth) + 28),
      behavior: reducedMotion ? 'instant' : 'smooth',
    });
  };

  return (
    <div role="region" aria-label={label} aria-roledescription="carousel">
      <div className={`${count > 1 ? 'mb-6' : 'hidden'} flex items-center justify-end gap-4`}>
        {count > 1 && (
          <div className="flex gap-3">
            <button
              type="button"
              className="icon-button"
              aria-label={`Previous ${label}`}
              aria-controls={id}
              disabled={position.left < 2}
              onClick={() => move(-1)}
            >
              <ArrowLeftIcon className="size-4" />
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label={`Next ${label}`}
              aria-controls={id}
              disabled={position.left >= position.max - 2}
              onClick={() => move(1)}
            >
              <ArrowRightIcon className="size-4" />
            </button>
          </div>
        )}
      </div>
      <div
        ref={ref}
        id={id}
        className="editorial-track flex snap-x snap-mandatory gap-7 overflow-x-auto pb-2"
      >
        {Children.map(children, (child, index) => (
          <div
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}`}
            className="w-[88%] min-w-0 shrink-0 snap-start sm:w-[63%] lg:w-[46%]"
          >
            {child}
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="relative mt-9 h-px bg-muted-300">
        <div
          className="absolute inset-y-0 bg-ink"
          style={{
            width: `${position.visible * 100}%`,
            left: `${position.max ? (position.left / position.max) * (1 - position.visible) * 100 : 0}%`,
          }}
        />
      </div>
    </div>
  );
}
