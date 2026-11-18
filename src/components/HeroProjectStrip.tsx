import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent,
} from 'react';
import { PROJECTS } from '../data/portfolioData';
import type { Project } from '../types/portfolio';
import { buildCloudinarySrcSet } from '../utils/contentMigration';
import { animateImageReveal } from '../utils/gsapAnimations';
import { ensureTooltipSupport } from '../utils/tooltipPolyfills';
import { ArrowLeftIcon, ArrowRightIcon, InfoIcon, PauseIcon, PlayIcon } from './Icons';
import { ImagePlaceholder } from './ImagePlaceholder';
import { HeroStripSkeleton, ProgressiveImageFrame } from './Skeleton';

interface HeroProjectStripProps {
  projects?: Project[];
  isLoading?: boolean;
}

interface PreviewVisualProps {
  project: Project;
  priority?: 'high' | 'low';
  lazy?: boolean;
}

function PreviewVisual({ project, priority, lazy = false }: PreviewVisualProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  if (project.imageURL && !project.isPasswordProtected && !imgError) {
    return (
      <ProgressiveImageFrame aspectRatio="aspect-video" loaded={imgLoaded}>
        <img
          src={project.imageURL}
          srcSet={buildCloudinarySrcSet(project.imageURL, [400, 640, 960])}
          sizes="(max-width: 640px) 60vw, 400px"
          alt={project.title}
          width={640}
          height={360}
          loading={lazy ? 'lazy' : undefined}
          fetchPriority={priority}
          decoding="async"
          draggable={false}
          onLoad={(event) => {
            setImgLoaded(true);
            animateImageReveal(event.currentTarget);
          }}
          onError={() => {
            setImgLoaded(true);
            setImgError(true);
          }}
          className="pointer-events-none relative z-[1] h-full w-full select-none object-cover"
        />
      </ProgressiveImageFrame>
    );
  }

  return (
    <ImagePlaceholder
      label={project.title}
      aspectRatio="aspect-video"
      badge={project.isPasswordProtected ? 'Protected' : undefined}
      badgeColor="bg-ink text-white"
    />
  );
}

/**
 * Ambient hero marquee preview strip with non-clickable 16:9 visuals, swipe/drag/arrow browsing,
 * toggletip instructions, and Play/Pause playback control.
 */
export function HeroProjectStrip({
  projects: customProjects,
  isLoading = false,
}: HeroProjectStripProps = {}) {
  const projects = isLoading
    ? []
    : customProjects && customProjects.length > 0
      ? customProjects
      : PROJECTS;
  const root = useRef<HTMLDivElement>(null);
  const group = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    active: boolean;
    pointerId: number | null;
    startX: number;
    startScrollLeft: number;
    moved: boolean;
  }>({
    active: false,
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });

  const id = useId();
  const tooltipId = useId();
  const [width, setWidth] = useState(0);
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );
  const [paused, setPaused] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [visible, setVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(() =>
    typeof document !== 'undefined' ? !document.hidden : true,
  );
  const staticMode = reduced || paused;

  useEffect(() => {
    void ensureTooltipSupport();
  }, []);

  useEffect(() => {
    const tooltipEl = tooltipRef.current;
    if (!tooltipEl) return;

    const handleToggle = (event: Event) => {
      const newState = (event as Event & { newState?: string }).newState;
      if (newState === 'open' || newState === 'closed') {
        setTooltipOpen(newState === 'open');
        return;
      }
      const isOpen =
        tooltipEl.classList.contains(':popover-open') ||
        (typeof tooltipEl.matches === 'function' &&
          (() => {
            try {
              return tooltipEl.matches(':popover-open');
            } catch {
              return false;
            }
          })());
      setTooltipOpen(isOpen);
    };

    tooltipEl.addEventListener('toggle', handleToggle);
    return () => {
      tooltipEl.removeEventListener('toggle', handleToggle);
    };
  }, [isLoading]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener?.('change', update);

    const visibility = () => setDocumentVisible(!document.hidden);
    document.addEventListener('visibilitychange', visibility);

    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined' && root.current) {
      observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
        threshold: 0.05,
      });
      observer.observe(root.current);
    } else {
      setVisible(true);
    }

    return () => {
      query.removeEventListener?.('change', update);
      document.removeEventListener('visibilitychange', visibility);
      observer?.disconnect();
    };
  }, [isLoading]);

  useEffect(() => {
    if (isLoading || !group.current || typeof ResizeObserver === 'undefined') return;
    const measure = () => setWidth(group.current?.getBoundingClientRect().width ?? 0);
    const observer = new ResizeObserver(measure);
    observer.observe(group.current);
    measure();
    return () => observer.disconnect();
  }, [staticMode, projects.length, isLoading]);

  useEffect(() => {
    if (!staticMode && viewport.current) viewport.current.scrollLeft = 0;
  }, [staticMode]);

  const scrollStep = (direction: -1 | 1) => {
    setPaused(true);
    const view = viewport.current;
    if (!view) return;
    const firstCard = view.querySelector<HTMLElement>('.hero-preview');
    const stepDistance = (firstCard?.offsetWidth || view.clientWidth || 320) + 24;
    view.scrollBy?.({
      left: direction * stepDistance,
      behavior: reduced ? 'instant' : 'smooth',
    });
  };

  const handleViewportKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollStep(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollStep(1);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') {
      setPaused(true);
      return;
    }
    if (event.button !== 0 || !viewport.current) return;
    dragState.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: viewport.current.scrollLeft,
      moved: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = dragState.current;
    const view = viewport.current;
    if (!state.active || !view || event.pointerId !== state.pointerId) return;

    const deltaX = event.clientX - state.startX;
    if (Math.abs(deltaX) > 6) {
      if (!state.moved) {
        state.moved = true;
        setDragging(true);
        setPaused(true);
      }
      view.scrollLeft = state.startScrollLeft - deltaX;
    }
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragState.current.pointerId !== event.pointerId) return;
    dragState.current.active = false;
    dragState.current.pointerId = null;
    dragState.current.moved = false;
    setDragging(false);
  };

  const renderSlides = (isDuplicateGroup = false) =>
    projects.map((project, index) => {
      const lazy = isDuplicateGroup || index >= 3;
      const priority: 'high' | 'low' | undefined = isDuplicateGroup
        ? 'low'
        : index === 0
          ? 'high'
          : index >= 3
            ? 'low'
            : undefined;
      return (
        <div key={project.id} className="hero-preview">
          <PreviewVisual project={project} priority={priority} lazy={lazy} />
        </div>
      );
    });

  if (isLoading) {
    return <HeroStripSkeleton />;
  }

  return (
    <div
      ref={root}
      className="pb-10"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div className="page-shell mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            popoverTarget={tooltipId}
            popoverTargetAction="show"
            {...({ interestfor: tooltipId } as Record<string, string>)}
            aria-label="How to browse project previews"
            aria-expanded={tooltipOpen}
            data-testid="hero-strip-tooltip-trigger"
            className="icon-button hero-toggletip-trigger bg-white"
          >
            <InfoIcon className="size-4" />
          </button>
          <div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            {...({ popover: 'hint' } as Record<string, string>)}
            data-testid="hero-strip-tooltip"
            className="hero-toggletip"
          >
            <div className="hero-toggletip-inner">
              Swipe, drag, or use arrows to browse selected previews
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="icon-button bg-white"
            aria-label="Previous project preview"
            aria-controls={id}
            onClick={() => scrollStep(-1)}
          >
            <ArrowLeftIcon className="size-4" />
          </button>
          <button
            type="button"
            className="icon-button bg-white"
            aria-label="Next project preview"
            aria-controls={id}
            onClick={() => scrollStep(1)}
          >
            <ArrowRightIcon className="size-4" />
          </button>
          {reduced ? (
            <span className="ml-1 text-xs text-muted-600">Motion is off</span>
          ) : (
            <button
              type="button"
              className="icon-button bg-white"
              aria-controls={id}
              aria-pressed={paused}
              data-testid="hero-strip-play-pause"
              onClick={() => setPaused((prev) => !prev)}
              aria-label={staticMode ? 'Play project previews' : 'Pause project previews'}
              title={staticMode ? 'Play' : 'Pause'}
            >
              {staticMode ? <PlayIcon className="size-4" /> : <PauseIcon className="size-4" />}
            </button>
          )}
        </div>
      </div>

      <div
        ref={viewport}
        id={id}
        role="region"
        aria-label="Project previews"
        tabIndex={0}
        onKeyDown={handleViewportKeyDown}
        onTouchStart={() => setPaused(true)}
        onWheel={(event) => {
          if (Math.abs(event.deltaX) > 4) setPaused(true);
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`editorial-track overflow-x-auto select-none focus-visible:outline-brand ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div
          className={`flex w-max ${staticMode ? '' : 'hero-marquee'}`}
          style={
            {
              '--strip-width': `${width}px`,
              '--strip-duration': `${Math.max(20, width / 30)}s`,
              animationPlayState:
                !hovered && !focused && visible && documentVisible && width > 0
                  ? 'running'
                  : 'paused',
            } as CSSProperties
          }
        >
          {!staticMode && (
            <div key="before" aria-hidden="true" inert className="flex shrink-0 gap-6 pr-6">
              {renderSlides(true)}
            </div>
          )}
          <div
            key="original"
            ref={group}
            className={`flex shrink-0 gap-6 pr-6 ${staticMode ? 'pl-6' : ''}`}
          >
            {renderSlides(false)}
          </div>
          {!staticMode && (
            <div key="after" aria-hidden="true" inert className="flex shrink-0 gap-6 pr-6">
              {renderSlides(true)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
