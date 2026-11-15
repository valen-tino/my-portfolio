import React, { useCallback, useEffect, useRef } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from './Icons';

export interface LightboxImageItem {
  src: string;
  alt?: string;
}

interface ImageLightboxModalProps {
  images: LightboxImageItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
}

const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onSelectIndex,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const hasMultiple = images.length > 1;
  const currentImage = images[currentIndex];

  const handlePrev = useCallback(() => {
    if (!hasMultiple) return;
    onSelectIndex((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, hasMultiple, images.length, onSelectIndex]);

  const handleNext = useCallback(() => {
    if (!hasMultiple) return;
    onSelectIndex((currentIndex + 1) % images.length);
  }, [currentIndex, hasMultiple, images.length, onSelectIndex]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && currentImage) {
      if (!dialog.open) {
        if (typeof dialog.showModal === 'function') {
          dialog.showModal();
        } else {
          dialog.setAttribute('open', '');
        }
      }
    } else if (dialog.open) {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    }
  }, [isOpen, currentImage]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrev, handleNext]);

  if (!isOpen || !currentImage) return null;

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as Record<string, string>)}
      data-testid="image-lightbox-modal"
      aria-label="Image preview"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="fixed inset-0 m-0 flex h-dvh max-h-none w-screen max-w-none select-none items-center justify-center overscroll-contain bg-black/90 p-4 backdrop:bg-black/90"
    >
      <div className="pointer-events-none absolute left-4 right-4 top-4 z-10 flex items-center justify-between text-white">
        <div className="pointer-events-auto rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-md sm:text-sm">
          {hasMultiple ? `${currentIndex + 1} / ${images.length}` : 'Image Preview'}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto flex size-10 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30"
          aria-label="Close image preview"
          data-testid="lightbox-close-btn"
          autoFocus
        >
          <CloseIcon className="size-5" />
        </button>
      </div>

      {hasMultiple && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-3 z-10 flex size-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30 sm:left-6 sm:size-12"
          aria-label="Previous image"
          data-testid="lightbox-prev-btn"
        >
          <ArrowLeftIcon className="size-5" />
        </button>
      )}

      <div
        className="relative flex max-h-[85vh] max-w-[92vw] flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage.src}
          alt={currentImage.alt || 'Full size preview'}
          className="max-h-[78vh] max-w-full object-contain shadow-2xl"
          data-testid="lightbox-image"
        />
        {currentImage.alt && (
          <p className="mt-3 max-w-xl px-4 text-center text-xs text-muted-300 sm:text-sm">
            {currentImage.alt}
          </p>
        )}
      </div>

      {hasMultiple && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-3 z-10 flex size-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30 sm:right-6 sm:size-12"
          aria-label="Next image"
          data-testid="lightbox-next-btn"
        >
          <ArrowRightIcon className="size-5" />
        </button>
      )}
    </dialog>
  );
};

export default ImageLightboxModal;
