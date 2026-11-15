import React, { useEffect, useState } from 'react';

export interface LoadingScreenProps {
  isLoading: boolean;
  label?: string;
}

const FADE_OUT_MS = 550;

export function LoadingScreen({
  isLoading,
  label = 'Loading content...',
}: LoadingScreenProps) {
  const [shouldRender, setShouldRender] = useState<boolean>(isLoading);

  useEffect(() => {
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', '#f8f8fa');
    }

    if (isLoading) {
      setShouldRender(true);
      return;
    }

    const timer = window.setTimeout(() => {
      setShouldRender(false);
    }, FADE_OUT_MS);

    return () => window.clearTimeout(timer);
  }, [isLoading]);

  if (!isLoading && !shouldRender) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      aria-hidden={!isLoading}
      data-testid="loading-screen"
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && !isLoading) {
          setShouldRender(false);
        }
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-brand transition-opacity duration-500 ease-in-out motion-reduce:duration-150 ${
        isLoading
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      }`}
    >
      <img
        src="/favicon.ico"
        alt=""
        width={64}
        height={64}
        className={`size-16 object-contain transition-transform duration-500 ease-in-out motion-safe:animate-pulse ${
          isLoading ? 'scale-100' : 'scale-95'
        }`}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default LoadingScreen;

