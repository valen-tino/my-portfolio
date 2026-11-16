import type { ReactNode } from 'react';

interface SkeletonBoxProps {
  className?: string;
}

/**
 * Decorative animated shimmer block for loading placeholders.
 * Respects `prefers-reduced-motion` via `motion-reduce:animate-none`.
 */
export function SkeletonBox({ className = '' }: SkeletonBoxProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-[#e7e7e9] motion-reduce:animate-none ${className}`}
    />
  );
}

interface DarkSkeletonBoxProps {
  className?: string;
}

function DarkSkeletonBox({ className = '' }: DarkSkeletonBoxProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-white/20 motion-reduce:animate-none ${className}`}
    />
  );
}

/**
 * Skeleton container for images that keeps exact aspect-ratio parent class directly around `<img>`
 * and pulses behind the image until `onLoad` or `onError`.
 */
interface ProgressiveImageFrameProps {
  aspectRatio?: string;
  loaded: boolean;
  className?: string;
  children: ReactNode;
}

export function ProgressiveImageFrame({
  aspectRatio = 'aspect-video',
  loaded,
  className = '',
  children,
}: ProgressiveImageFrameProps) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-[#e7e7e9] outline outline-1 -outline-offset-1 outline-black/10 ${
        loaded ? '' : 'animate-pulse motion-reduce:animate-none'
      } ${aspectRatio} ${className}`}
    >
      {children}
    </div>
  );
}

export function HeroStripSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading project previews"
      data-testid="hero-strip-skeleton"
      className="pb-10"
    >
      <div className="page-shell mb-5 flex items-center justify-between gap-4">
        <SkeletonBox className="size-11 rounded-full" />
        <div className="flex items-center gap-2">
          <SkeletonBox className="size-11 rounded-full" />
          <SkeletonBox className="size-11 rounded-full" />
          <SkeletonBox className="size-11 rounded-full" />
        </div>
      </div>
      <div className="editorial-track overflow-x-auto pl-6">
        <div className="flex w-max gap-6 pr-6">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="hero-preview">
              <SkeletonBox className="aspect-video w-full outline outline-1 -outline-offset-1 outline-black/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProjectCardSkeletonGrid({
  count = 3,
  carouselMode = false,
}: {
  count?: number;
  carouselMode?: boolean;
}) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading projects"
      data-testid="projects-skeleton"
      className={
        carouselMode
          ? 'grid gap-7 md:grid-cols-2 lg:grid-cols-3'
          : 'grid gap-x-7 gap-y-14 md:grid-cols-2 xl:grid-cols-3'
      }
    >
      {Array.from({ length: count }, (_, idx) => (
        <div key={idx} aria-hidden="true" className="min-w-0">
          <SkeletonBox className="aspect-video w-full outline outline-1 -outline-offset-1 outline-black/10" />
          <div className="mt-5 flex items-start justify-between gap-4">
            <SkeletonBox className="h-7 w-3/4 rounded" />
            <SkeletonBox className="mt-1 h-4 w-10 rounded" />
          </div>
          <SkeletonBox className="mt-2 h-4 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}

export function BlogCardSkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading articles"
      data-testid="blogs-skeleton"
      className="grid gap-x-7 gap-y-14 md:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: count }, (_, idx) => (
        <div key={idx} aria-hidden="true" className="min-w-0">
          <SkeletonBox className="aspect-[16/10] w-full outline outline-1 -outline-offset-1 outline-black/10" />
          <div className="mt-5 flex gap-3">
            <SkeletonBox className="h-3.5 w-16 rounded" />
            <SkeletonBox className="h-3.5 w-24 rounded" />
            <SkeletonBox className="h-3.5 w-16 rounded" />
          </div>
          <SkeletonBox className="mt-3 h-7 w-4/5 rounded" />
        </div>
      ))}
    </div>
  );
}

export function PortfolioTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading portfolio table"
      data-testid="portfolio-table-skeleton"
      className="space-y-4 border-t border-muted-300 pt-4"
    >
      {Array.from({ length: rows }, (_, idx) => (
        <div
          key={idx}
          aria-hidden="true"
          className="flex items-center justify-between gap-4 border-b border-muted-300/80 py-4"
        >
          <SkeletonBox className="h-4 w-10 rounded" />
          <SkeletonBox className="h-5 w-48 rounded sm:w-64" />
          <SkeletonBox className="hidden h-4 w-32 rounded sm:block" />
          <SkeletonBox className="hidden h-4 w-24 rounded md:block" />
          <SkeletonBox className="hidden h-4 w-12 rounded sm:block" />
        </div>
      ))}
    </div>
  );
}

export function FilterBarSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading filters"
      data-testid="filter-bar-skeleton"
      className="mb-8 hidden bg-paper p-5 md:block"
    >
      <div className="flex flex-wrap gap-2">
        {[88, 112, 96, 128, 104].map((width, idx) => (
          <SkeletonBox key={idx} className="h-10 rounded-full" />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <SkeletonBox className="h-11 w-64 rounded" />
        <SkeletonBox className="h-11 w-40 rounded-full" />
      </div>
    </div>
  );
}

export function WorkProcessSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading work process"
      data-testid="work-process-skeleton"
    >
      <div className="flex flex-nowrap gap-3 overflow-x-auto pb-1">
        {[120, 100, 108, 130, 148, 92].map((w, idx) => (
          <div
            key={idx}
            aria-hidden="true"
            style={{ width: `${w}px` }}
            className="h-12 shrink-0 animate-pulse rounded-full bg-[#e7e7e9] motion-reduce:animate-none"
          />
        ))}
      </div>
      <div aria-hidden="true" className="mt-8 bg-white p-6 sm:p-10">
        <SkeletonBox className="h-9 w-48 rounded" />
        <SkeletonBox className="mt-5 h-5 w-full max-w-[65ch] rounded" />
        <SkeletonBox className="mt-3 h-5 w-4/5 max-w-[52ch] rounded" />
      </div>
    </div>
  );
}

export function AboutSectionSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading about information"
      data-testid="about-skeleton"
      className="grid gap-10 lg:grid-cols-[2fr_1fr]"
    >
      <div aria-hidden="true">
        <div className="max-w-[65ch] space-y-3">
          <SkeletonBox className="h-5 w-full rounded" />
          <SkeletonBox className="h-5 w-full rounded" />
          <SkeletonBox className="h-5 w-5/6 rounded" />
          <SkeletonBox className="h-5 w-3/4 rounded" />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <SkeletonBox className="h-11 w-40 rounded-full" />
          <SkeletonBox className="h-11 w-40 rounded-full" />
        </div>
        <div className="mt-12 grid grid-cols-3 gap-4 border-t border-muted-300 pt-6">
          {[0, 1, 2].map((idx) => (
            <div key={idx}>
              <SkeletonBox className="h-10 w-16 rounded sm:h-12" />
              <SkeletonBox className="mt-3 h-3.5 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div aria-hidden="true">
        <div className="max-w-xs">
          <SkeletonBox className="aspect-[4/5] w-full outline outline-1 -outline-offset-1 outline-black/10" />
        </div>
        <SkeletonBox className="mt-3 h-3.5 w-44 rounded" />
      </div>
    </div>
  );
}

export function TimelineListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading timeline entries"
      data-testid="timeline-skeleton"
      className="pt-2"
    >
      {Array.from({ length: rows }, (_, idx) => (
        <div key={idx} aria-hidden="true" className="border-t border-muted-300 py-6">
          <div className="flex flex-wrap justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <SkeletonBox className="mt-0.5 size-10 shrink-0 rounded-lg" />
              <div>
                <SkeletonBox className="h-6 w-48 rounded" />
                <SkeletonBox className="mt-2 h-4 w-36 rounded" />
              </div>
            </div>
            <SkeletonBox className="h-4 w-32 rounded" />
          </div>
          <div className="mt-4 max-w-[65ch] space-y-2">
            <SkeletonBox className="h-4 w-full rounded" />
            <SkeletonBox className="h-4 w-4/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PortfolioDetailSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading portfolio case study"
      data-testid="portfolio-detail-skeleton"
      className="page-shell py-12 sm:py-20"
    >
      <div aria-hidden="true" className="mb-12 flex items-center gap-3">
        <SkeletonBox className="h-4 w-12 rounded" />
        <SkeletonBox className="h-4 w-16 rounded" />
        <SkeletonBox className="h-4 w-36 rounded" />
      </div>
      <div
        aria-hidden="true"
        className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.5fr] lg:items-start lg:gap-20"
      >
        <div className="min-w-0 space-y-6">
          <SkeletonBox className="h-12 w-4/5 rounded" />
          <SkeletonBox className="h-5 w-2/3 rounded" />
          <SkeletonBox className="aspect-video w-full" />
          <div className="space-y-4">
            <SkeletonBox className="h-4 w-24 rounded" />
            <SkeletonBox className="h-5 w-20 rounded" />
            <SkeletonBox className="h-4 w-28 rounded" />
            <SkeletonBox className="h-5 w-48 rounded" />
          </div>
          <div className="flex gap-4 pt-2">
            <SkeletonBox className="h-12 w-36 rounded-full" />
            <SkeletonBox className="h-12 w-40 rounded-full" />
          </div>
        </div>
        <div className="min-w-0 max-w-[65ch] space-y-8">
          <SkeletonBox className="h-8 w-56 rounded" />
          <div className="space-y-3">
            <SkeletonBox className="h-4 w-full rounded" />
            <SkeletonBox className="h-4 w-full rounded" />
            <SkeletonBox className="h-4 w-5/6 rounded" />
          </div>
          <SkeletonBox className="h-8 w-64 rounded" />
          <div className="space-y-3">
            <SkeletonBox className="h-4 w-full rounded" />
            <SkeletonBox className="h-4 w-11/12 rounded" />
            <SkeletonBox className="h-4 w-4/5 rounded" />
          </div>
        </div>
      </div>
    </main>
  );
}

export function BlogDetailSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading journal article"
      data-testid="blog-detail-skeleton"
      className="page-shell py-12 sm:py-20"
    >
      <div aria-hidden="true" className="mx-auto max-w-3xl space-y-6">
        <div className="flex gap-3">
          <SkeletonBox className="h-4 w-12 rounded" />
          <SkeletonBox className="h-4 w-16 rounded" />
          <SkeletonBox className="h-4 w-40 rounded" />
        </div>
        <SkeletonBox className="h-11 w-36 rounded-full" />
        <SkeletonBox className="h-4 w-48 rounded" />
        <SkeletonBox className="h-12 w-5/6 rounded sm:h-14" />
        <SkeletonBox className="h-6 w-3/4 rounded" />
        <SkeletonBox className="aspect-[16/9] w-full" />
        <div className="space-y-3 pt-4">
          <SkeletonBox className="h-4 w-full rounded" />
          <SkeletonBox className="h-4 w-full rounded" />
          <SkeletonBox className="h-4 w-5/6 rounded" />
          <SkeletonBox className="h-4 w-2/3 rounded" />
        </div>
      </div>
    </main>
  );
}

export function FooterSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading footer content" data-testid="footer-skeleton">
      <div className="relative overflow-hidden bg-brand p-8 sm:p-12">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div aria-hidden="true" className="w-full max-w-xl space-y-3">
            <DarkSkeletonBox className="h-9 w-4/5 rounded sm:h-12" />
            <DarkSkeletonBox className="h-9 w-2/3 rounded sm:h-12" />
          </div>
          <div aria-hidden="true" className="flex flex-wrap items-center gap-4">
            <DarkSkeletonBox className="h-12 w-48 rounded-full" />
            <DarkSkeletonBox className="h-12 w-56 rounded-full" />
          </div>
        </div>
        <div aria-hidden="true" className="mt-10 grid h-2 grid-cols-3 gap-2">
          <span className="rounded-full bg-mint" />
          <span className="rounded-full bg-orange" />
          <span className="rounded-full bg-pink" />
        </div>
      </div>

      <div className="mt-14 grid gap-10 border-b border-white/15 pb-12 md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div aria-hidden="true" className="space-y-3">
          <DarkSkeletonBox className="h-7 w-44 rounded" />
          <DarkSkeletonBox className="h-4 w-64 rounded" />
          <DarkSkeletonBox className="h-4 w-52 rounded" />
          <DarkSkeletonBox className="mt-2 h-8 w-44 rounded-full" />
        </div>
        <div aria-hidden="true" className="space-y-4">
          <DarkSkeletonBox className="h-3.5 w-20 rounded" />
          <div className="grid grid-cols-2 gap-3">
            <DarkSkeletonBox className="h-4 w-20 rounded" />
            <DarkSkeletonBox className="h-4 w-24 rounded" />
            <DarkSkeletonBox className="h-4 w-16 rounded" />
            <DarkSkeletonBox className="h-4 w-20 rounded" />
          </div>
        </div>
        <div aria-hidden="true" className="space-y-4">
          <DarkSkeletonBox className="h-3.5 w-20 rounded" />
          <div className="flex flex-wrap gap-2.5">
            <DarkSkeletonBox className="h-11 w-24 rounded-full" />
            <DarkSkeletonBox className="h-11 w-24 rounded-full" />
            <DarkSkeletonBox className="h-11 w-24 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CVModalSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading résumé details" data-testid="cv-modal-skeleton">
      <div aria-hidden="true" className="mt-6 space-y-2">
        <SkeletonBox className="h-4 w-full rounded" />
        <SkeletonBox className="h-4 w-5/6 rounded" />
      </div>
      <div aria-hidden="true" className="mt-8 space-y-4">
        <SkeletonBox className="h-6 w-28 rounded" />
        {[0, 1].map((idx) => (
          <div key={idx} className="border-t border-muted-300 py-4">
            <SkeletonBox className="h-4 w-56 rounded" />
            <SkeletonBox className="mt-2 h-3 w-32 rounded" />
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="mt-6 space-y-4">
        <SkeletonBox className="h-6 w-28 rounded" />
        {[0, 1].map((idx) => (
          <div key={idx} className="border-t border-muted-300 py-4">
            <SkeletonBox className="h-4 w-60 rounded" />
            <SkeletonBox className="mt-2 h-3 w-40 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
