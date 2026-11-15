let initPromise: Promise<void> | null = null;
let beforeToggleHooked = false;

/**
 * Conditionally loads native popover / interestfor polyfills and upgrades unsupported
 * `popover="hint"` toggletips to `popover="auto"` during `beforetoggle` so light dismiss
 * and Escape keep working across browsers.
 */
export function ensureTooltipSupport(): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve();
  }
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      if (!Object.hasOwn(HTMLElement.prototype, 'popover')) {
        await import('@oddbird/popover-polyfill');
      }

      if (!beforeToggleHooked && 'popover' in HTMLElement.prototype) {
        const probe = document.createElement('div');
        probe.popover = 'hint';
        if (probe.popover !== 'hint') {
          beforeToggleHooked = true;
          document.addEventListener(
            'beforetoggle',
            (event) => {
              const target = event.target as HTMLElement | null;
              const newState = (event as Event & { newState?: string }).newState;
              if (!target || newState !== 'open') return;
              const escapedId =
                target.id && typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
                  ? CSS.escape(target.id)
                  : target.id;
              const isToggletip =
                target.getAttribute('popover') === 'hint' &&
                Boolean(escapedId && document.querySelector(`[popovertarget="${escapedId}"]`));
              if (isToggletip) {
                target.popover = 'auto';
              }
            },
            true,
          );
        }
      }

      if (
        typeof HTMLButtonElement !== 'undefined' &&
        !('interestForElement' in HTMLButtonElement.prototype)
      ) {
        await import('interestfor');
      }
    } catch {
      // Non-fatal in constrained test/headless environments
    }
  })();

  return initPromise;
}

