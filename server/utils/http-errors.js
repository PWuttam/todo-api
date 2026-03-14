const DEFAULT_MESSAGES = {
  400: 'Bad request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not found',
  429: 'Too many requests',
  500: 'Internal Server Error',
};

const DEFAULT_CODES = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  429: 'RATE_LIMIT_EXCEEDED',
  500: 'INTERNAL_ERROR',
};

export function normalizeValidationDetails(errors = []) {
  return errors.map((error) => ({
    field: error.field ?? error.path ?? error.param ?? '',
    msg: error.msg ?? error.message ?? 'Invalid value',
  }));
}

export function createHttpError(status, message, code, details) {
  const error = new Error(message || DEFAULT_MESSAGES[status] || DEFAULT_MESSAGES[500]);
  error.status = status;
  error.code = code || DEFAULT_CODES[status] || DEFAULT_CODES[500];

  if (details?.length) {
    error.details = details;
  }

  return error;
}

export function createValidationError(errors = []) {
  return createHttpError(
    400,
    'Validation error',
    'VALIDATION_ERROR',
    normalizeValidationDetails(errors)
  );
}

export function createNotFoundError(message = 'Not found') {
  return createHttpError(404, message, 'NOT_FOUND');
}

export function getDefaultErrorCode(status) {
  return DEFAULT_CODES[status] || (status >= 500 ? DEFAULT_CODES[500] : DEFAULT_CODES[400]);
}

export function getDefaultErrorMessage(status) {
  return (
    DEFAULT_MESSAGES[status] || (status >= 500 ? DEFAULT_MESSAGES[500] : DEFAULT_MESSAGES[400])
  );
}
