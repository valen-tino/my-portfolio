import React, { useEffect, useCallback } from 'react';

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
  onSelectIndex
}) => {
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
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !currentImage) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 select-none"
      onClick={onClose}
      data-testid="image-lightbox-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      {/* Top Bar: Counter & Close Button */}
      <div
        className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10 pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs sm:text-sm font-medium pointer-events-auto">
          {hasMultiple ? `${currentIndex + 1} / ${images.length}` : 'Image Preview'}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white text-lg font-bold transition-colors pointer-events-auto"
          aria-label="Close image preview"
          data-testid="lightbox-close-btn"
        >
          ✕
        </button>
      </div>

      {/* Previous Button */}
      {hasMultiple && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-3 sm:left-6 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center text-2xl transition-colors"
          aria-label="Previous image"
          data-testid="lightbox-prev-btn"
        >
          ‹
        </button>
      )}

      {/* Main Image Container */}
      <div
        className="relative max-w-[92vw] max-h-[85vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage.src}
          alt={currentImage.alt || 'Full size preview'}
          className="max-w-full max-h-[78vh] object-contain rounded-lg shadow-2xl transition-transform duration-200"
          data-testid="lightbox-image"
        />
        {currentImage.alt && (
          <p className="mt-3 text-xs sm:text-sm text-gray-300 text-center max-w-xl px-4">
            {currentImage.alt}
          </p>
        )}
      </div>

      {/* Next Button */}
      {hasMultiple && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-3 sm:right-6 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center text-2xl transition-colors"
          aria-label="Next image"
          data-testid="lightbox-next-btn"
        >
          ›
        </button>
      )}
    </div>
  );
};

export default ImageLightboxModal;

