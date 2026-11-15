import React, { useEffect, useRef, useState } from 'react';
import { CloseIcon, LockIcon } from './Icons';

interface PasswordProtectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  portfolioTitle: string;
  error?: string;
}

const PasswordProtectionModal: React.FC<PasswordProtectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  portfolioTitle,
  error,
}) => {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsSubmitting(true);
    onSubmit(password);
    setTimeout(() => setIsSubmitting(false), 1000);
  };

  const handleClose = () => {
    setPassword('');
    onClose();
  };

  const handleLightDismissFallback = (event: React.MouseEvent<HTMLDialogElement>) => {
    if ('closedBy' in HTMLDialogElement.prototype) return;
    const dialog = dialogRef.current;
    if (!dialog || event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    const clickedInDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;
    if (!clickedInDialog) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as Record<string, string>)}
      aria-labelledby="protected-portfolio-heading"
      onClose={handleClose}
      onClick={handleLightDismissFallback}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md overflow-y-auto overscroll-contain bg-white p-0 text-ink shadow-2xl backdrop:bg-black/60"
    >
      <div className="border-b border-muted-200 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="protected-portfolio-heading"
              className="flex items-center gap-2 text-xl font-semibold tracking-tight text-ink"
            >
              <LockIcon className="size-5 text-brand" />
              Protected Portfolio
            </h2>
            <p className="mt-1 text-sm text-muted-600">
              “{portfolioTitle}” requires a password to view.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close password modal"
            className="icon-button"
            disabled={isSubmitting}
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="portfolio-access-password"
              className="mb-2 block text-sm font-medium text-ink"
            >
              Enter Password
            </label>
            <input
              id="portfolio-access-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
              placeholder="Portfolio password"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {error && (
            <p role="alert" className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flat-button flat-button-outline"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flat-button flat-button-blue"
              disabled={!password.trim() || isSubmitting}
            >
              {isSubmitting ? 'Checking...' : 'Access Portfolio'}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
};

export default PasswordProtectionModal;
