// server/middlewares/error.js
import {
  createHttpError,
  getDefaultErrorCode,
  getDefaultErrorMessage,
  normalizeValidationDetails,
} from '../utils/http-errors.js';

function fromMongooseValidationError(err) {
  const details = normalizeValidationDetails(
    Object.values(err.errors || {}).map((error) => ({
      field: error.path,
      msg: error.message,
    }))
  );

  return createHttpError(400, 'Validation error', 'VALIDATION_ERROR', details);
}

function normalizeError(err) {
  if (err?.name === 'ValidationError') {
    return fromMongooseValidationError(err);
  }

  if (err?.name === 'CastError') {
    return createHttpError(400, 'Bad request', 'BAD_REQUEST');
  }

  if (err?.type === 'entity.parse.failed') {
    return createHttpError(400, 'Bad request', 'BAD_REQUEST');
  }

  const status =
    (Number.isInteger(err?.status) && err.status) ||
    (Number.isInteger(err?.statusCode) && err.statusCode) ||
    500;

  const code =
    (typeof err?.code === 'string' && err.code) ||
    (typeof err?.errorCode === 'string' && err.errorCode) ||
    getDefaultErrorCode(status);

  const message =
    status >= 500 ? getDefaultErrorMessage(500) : err?.message || getDefaultErrorMessage(status);

  const normalized = createHttpError(status, message, code);

  if (status < 500 && Array.isArray(err?.details) && err.details.length > 0) {
    normalized.details = normalizeValidationDetails(err.details);
  }

  return normalized;
}

export default function errorHandler(err, _req, res, _next) {
  const normalized = normalizeError(err);
  const payload = {
    error: normalized.message,
    code: normalized.code,
  };

  if (normalized.details?.length) {
    payload.details = normalized.details;
  }

  console.error('Error caught by middleware:', err);

  res.status(normalized.status).json(payload);
}
