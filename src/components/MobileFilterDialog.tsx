import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import { CloseIcon } from './Icons';

interface MobileFilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAll: () => void;
  resultCount: number;
  activeFilterCount: number;
  children: ReactNode;
}

/**
 * Native `<dialog>` popup hosting Work Page filters on mobile viewports.
 * Stays mounted so native browser focus restoration returns to the Filter button on close.
 */
export function MobileFilterDialog({
  isOpen,
  onClose,
  onClearAll,
  resultCount,
  activeFilterCount,
  children,
}: MobileFilterDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
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
  }, [isOpen]);

  const handleLightDismissFallback = (event: MouseEvent<HTMLDialogElement>) => {
    if ('closedBy' in HTMLDialogElement.prototype) return;
    // Ignore non-pointer synthetic clicks (clientX=0, clientY=0 on keyboard activation).
    if (event.detail === 0) return;
    const dialog = dialogRef.current;
    if (!dialog || event.target !== dialog) return;

    const rect = dialog.getBoundingClientRect();
    const clickedInDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;

    if (!clickedInDialog) {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        onClose();
      }
    }
  };

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as Record<string, string>)}
      aria-labelledby="mobile-filters-heading"
      data-testid="mobile-filter-dialog"
      onClose={() => {
        if (isOpen) onClose();
      }}
      onClick={handleLightDismissFallback}
      className="fixed inset-x-0 bottom-0 top-auto m-0 hidden max-h-[88dvh] w-full max-w-none flex-col overflow-hidden border-t border-muted-300 bg-white p-0 text-ink shadow-2xl open:flex backdrop:bg-black/60 sm:inset-0 sm:m-auto sm:max-w-lg sm:border"
    >
      {isOpen && (
        <>
          <div className="flex shrink-0 items-center justify-between border-b border-muted-200 px-5 py-4">
            <div className="flex items-baseline gap-2.5">
              <h2 id="mobile-filters-heading" className="text-lg font-medium tracking-tight">
                Filters
              </h2>
              {activeFilterCount > 0 && (
                <span className="text-xs tabular-nums text-muted-600">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              data-testid="mobile-filter-close"
              className="icon-button"
            >
              <CloseIcon className="size-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
            {children}
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-muted-200 bg-white px-5 py-4">
            <button
              type="button"
              onClick={onClearAll}
              disabled={activeFilterCount === 0}
              data-testid="mobile-clear-filters"
              className="min-h-11 rounded-full border border-muted-400 px-4 py-2 text-xs font-medium text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={onClose}
              data-testid="mobile-apply-filters"
              className="flat-button flat-button-blue min-h-11 flex-1 justify-center rounded-full px-5 py-2 text-xs font-medium"
            >
              Show {resultCount} {resultCount === 1 ? 'project' : 'projects'}
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
