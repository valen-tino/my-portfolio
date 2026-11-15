import type { ReactNode } from 'react';
import { PhotoPlaceholderIcon } from './Icons';

interface ImagePlaceholderProps {
  label?: string;
  sublabel?: string;
  aspectRatio?: string;
  className?: string;
  badge?: string;
  badgeColor?: string;
  shape?: 'rect' | 'hexagon' | 'pill' | 'circle';
  showIcon?: boolean;
  overlayHeader?: ReactNode;
  overlayFooter?: ReactNode;
}

export function ImagePlaceholder({
  label = 'Image placeholder',
  sublabel,
  aspectRatio = 'aspect-video',
  className = '',
  badge,
  badgeColor = 'bg-white text-ink',
  shape = 'rect',
  showIcon = true,
  overlayHeader,
  overlayFooter,
}: ImagePlaceholderProps) {
  return (
    <div
      className={`relative flex min-w-0 items-center justify-center overflow-hidden bg-[#e7e7e9] outline outline-1 -outline-offset-1 outline-black/10 ${shape === 'circle' ? 'rounded-full' : ''} ${shape === 'rect' || shape === 'pill' ? aspectRatio : ''} ${className}`}
      role="img"
      aria-label={`${label}${sublabel ? ` — ${sublabel}` : ''}`}
    >
      <div
        aria-hidden="true"
        className="flex flex-col items-center gap-3 px-6 py-10 text-center text-muted-600"
      >
        {showIcon && <PhotoPlaceholderIcon className="size-8" />}
        <span className="max-w-[28ch] text-xs font-medium leading-relaxed">{label}</span>
      </div>
      {overlayHeader && <div className="absolute inset-x-4 top-4">{overlayHeader}</div>}
      {badge && !overlayHeader && (
        <span
          aria-hidden="true"
          className={`absolute right-4 top-4 px-3 py-1.5 text-xs font-medium ${badgeColor}`}
        >
          {badge}
        </span>
      )}
      {overlayFooter && <div className="absolute inset-x-4 bottom-4">{overlayFooter}</div>}
    </div>
  );
}
