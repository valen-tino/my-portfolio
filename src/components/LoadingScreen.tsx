import React from 'react';

export interface LoadingScreenProps {
  isLoading: boolean;
  label?: string;
}

export function LoadingScreen({
  isLoading,
  label = 'Loading content...',
}: LoadingScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      aria-hidden={!isLoading}
      data-testid="loading-screen"
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

