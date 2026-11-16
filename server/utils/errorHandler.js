/**
 * Formats Mongoose / MongoDB / runtime errors into consistent JSON API responses
 * containing status codes, detailed error lists, and per-field error maps.
 */
function handleRouteError(res, error, fallbackMessage = 'Server error') {
  if (error?.name === 'ValidationError' && error.errors) {
    const fieldErrors = {};
    const errors = [];

    for (const [key, err] of Object.entries(error.errors)) {
      const msg = err?.message || `Invalid value for ${key}`;
      fieldErrors[key] = msg;
      errors.push(msg);
    }

    const summary =
      errors.length > 0
        ? `Validation failed: ${errors.join('. ')}`
        : error.message || 'Validation error';

    return res.status(400).json({
      success: false,
      message: summary,
      errors,
      fieldErrors,
    });
  }

  if (error?.code === 11000) {
    const duplicateField =
      (error.keyPattern && Object.keys(error.keyPattern)[0]) ||
      (error.keyValue && Object.keys(error.keyValue)[0]) ||
      'field';
    const message = `A record with this ${duplicateField} already exists.`;

    return res.status(400).json({
      success: false,
      message,
      errors: [message],
      fieldErrors: { [duplicateField]: message },
    });
  }

  if (error?.name === 'CastError') {
    const field = error.path || 'id';
    const message =
      field === '_id' || field === 'id'
        ? 'Invalid ID format'
        : `Invalid ${field} format`;

    return res.status(400).json({
      success: false,
      message,
      errors: [message],
      fieldErrors: { [field]: message },
    });
  }

  const statusCode =
    Number.isInteger(error?.statusCode) && error.statusCode >= 400 && error.statusCode < 600
      ? error.statusCode
      : 500;

  return res.status(statusCode).json({
    success: false,
    message: fallbackMessage,
    error: error?.message || fallbackMessage,
  });
}

module.exports = {
  handleRouteError,
};

