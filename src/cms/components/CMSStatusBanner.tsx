import React from 'react';

export interface CMSMessage {
  type: 'success' | 'error' | 'warning' | 'info' | '';
  text: string;
  details?: string[];
}

interface CMSStatusBannerProps {
  message: CMSMessage;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
  dataTestId?: string;
}

const BANNER_STYLES: Record<'success' | 'error' | 'warning' | 'info', string> = {
  success: 'bg-emerald-50 border-emerald-300 text-emerald-900',
  error: 'bg-red-50 border-red-300 text-red-900',
  warning: 'bg-amber-50 border-amber-300 text-amber-900',
  info: 'bg-blue-50 border-blue-200 text-blue-900',
};

const ICON_PATHS: Record<'success' | 'error' | 'warning' | 'info', string> = {
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  error:
    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
  warning:
    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

export const CMSStatusBanner: React.FC<CMSStatusBannerProps> = ({
  message,
  onDismiss,
  onRetry,
  className = '',
  dataTestId,
}) => {
  if (!message.text) return null;

  const tone: 'success' | 'error' | 'warning' | 'info' = message.type || 'info';
  const isErrorOrWarning = tone === 'error' || tone === 'warning';
  const detailsToRender =
    message.details &&
    (message.details.length > 1 ||
      message.details.some((detail) => !message.text.includes(detail)))
      ? message.details
      : [];

  return (
    <div
      role={isErrorOrWarning ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      data-testid={dataTestId}
      className={`p-4 rounded-lg border flex items-start justify-between gap-3 ${BANNER_STYLES[tone]} ${className}`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={ICON_PATHS[tone]}
          />
        </svg>
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-medium break-words">{message.text}</p>
          {detailsToRender.length > 0 && (
            <ul className="mt-1.5 list-disc list-inside text-xs space-y-0.5">
              {detailsToRender.map((detail, idx) => (
                <li key={`${detail}-${idx}`}>{detail}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onRetry && isErrorOrWarning && (
          <button
            type="button"
            onClick={onRetry}
            className="px-3 py-1 text-xs font-semibold rounded-md bg-white border border-current hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            aria-label="Dismiss message"
            onClick={onDismiss}
            className="px-1.5 py-0.5 text-sm font-bold leading-none rounded hover:bg-black/5"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

interface CMSFieldErrorProps {
  error?: string;
  id?: string;
}

export const CMSFieldError: React.FC<CMSFieldErrorProps> = ({ error, id }) => {
  if (!error) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-red-600 flex items-center gap-1">
      {error}
    </p>
  );
};

export function getCMSInputErrorClasses(hasError?: boolean): string {
  return hasError
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
}

