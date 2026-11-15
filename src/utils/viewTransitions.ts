import type { NavigateFunction, NavigateOptions } from 'react-router-dom';

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

function focusMainHeadingAfterTransition(): void {
  if (typeof document === 'undefined') return;
  const target =
    (document.querySelector('h1') as HTMLElement | null) ||
    (document.querySelector('main') as HTMLElement | null);
  if (!target) return;
  if (!target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1');
  }
  target.focus({ preventScroll: true });
}

/**
 * Navigates cleanly inside the SPA using the native View Transitions API when supported
 * and reduced-motion is not active, gracefully falling back to standard navigation.
 */
export function navigateWithTransition(
  navigate: NavigateFunction,
  to: string,
  options?: NavigateOptions,
): void {
  if (typeof document === 'undefined') {
    navigate(to, options);
    return;
  }

  const reducedMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const doc = document as ViewTransitionDocument;
  if (typeof doc.startViewTransition !== 'function' || reducedMotion) {
    navigate(to, options);
    return;
  }

  const transition = doc.startViewTransition(() => {
    navigate(to, options);
  });

  transition.finished.finally(() => {
    focusMainHeadingAfterTransition();
  });
}

