export interface ParsedCMSError {
  message: string;
  details: string[];
  fieldErrors: Record<string, string>;
  status?: number;
  isNetworkError: boolean;
}

const GENERIC_VALIDATION_RE = /^validation\s*(error|failed)\.?$/i;
const NETWORK_ERROR_RE =
  /^(network error|failed to fetch|err_network)|ecconnrefused|timeout of \d+ms exceeded/i;

export function parseCMSError(
  error: unknown,
  fallbackMessage = 'An unexpected error occurred. Please try again.'
): ParsedCMSError {
  const errObj = (error && typeof error === 'object' ? error : null) as {
    response?: {
      status?: number;
      data?: {
        message?: unknown;
        error?: unknown;
        errors?: unknown;
        fieldErrors?: unknown;
      };
    };
    code?: string;
    message?: unknown;
  } | null;

  const response = errObj?.response;
  const status = typeof response?.status === 'number' ? response.status : undefined;
  const data = response?.data;

  const fieldErrors: Record<string, string> = {};
  if (data?.fieldErrors && typeof data.fieldErrors === 'object' && !Array.isArray(data.fieldErrors)) {
    for (const [key, val] of Object.entries(data.fieldErrors as Record<string, unknown>)) {
      if (typeof val === 'string' && val.trim()) {
        fieldErrors[key] = val.trim();
      }
    }
  }

  let details: string[] = [];
  if (Array.isArray(data?.errors)) {
    details = data.errors
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .map((item) => item.trim());
  } else if (Object.keys(fieldErrors).length > 0) {
    details = Object.values(fieldErrors);
  }

  const cloudinaryMessage =
    data?.error && typeof data.error === 'object' && 'message' in data.error
      ? (data.error as { message?: unknown }).message
      : undefined;

  const apiMessage = typeof data?.message === 'string' ? data.message.trim() : undefined;
  const apiErrorString = typeof data?.error === 'string' ? data.error.trim() : undefined;
  const rawErrorMessage = typeof errObj?.message === 'string' ? errObj.message.trim() : undefined;

  let isNetworkError = false;
  let message = '';

  if (typeof cloudinaryMessage === 'string' && cloudinaryMessage.trim()) {
    message = cloudinaryMessage.trim();
  } else if (apiMessage) {
    if (GENERIC_VALIDATION_RE.test(apiMessage) && details.length > 0) {
      message = `Validation failed: ${details.join('. ')}`;
    } else {
      message = apiMessage;
    }
  } else if (apiErrorString) {
    message = apiErrorString;
  } else if (details.length > 0) {
    message = `Validation failed: ${details.join('. ')}`;
  } else if (!response && rawErrorMessage) {
    if (
      errObj?.code === 'ERR_NETWORK' ||
      errObj?.code === 'ECONNABORTED' ||
      NETWORK_ERROR_RE.test(rawErrorMessage)
    ) {
      isNetworkError = true;
      message =
        'Unable to reach the server. Please check your internet connection and ensure the API server is running.';
    } else {
      message = rawErrorMessage;
    }
  } else if (status === 401 || status === 403) {
    message = 'Your session has expired or you do not have permission. Please sign in again.';
  } else if (status === 413) {
    message = 'The uploaded file or request payload is too large.';
  } else if (status && status >= 500) {
    message = fallbackMessage;
  } else {
    message = fallbackMessage;
  }

  return {
    message: message || fallbackMessage,
    details,
    fieldErrors,
    status,
    isNetworkError,
  };
}

export function formatCMSErrorText(error: unknown, fallbackMessage: string): string {
  return parseCMSError(error, fallbackMessage).message;
}

export function stripHtmlContent(html: string | undefined | null): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

