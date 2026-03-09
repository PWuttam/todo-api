function parseAllowedOrigins(corsOrigin) {
  if (!corsOrigin) {
    return [];
  }

  return corsOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function createCorsOptions({ nodeEnv, corsOrigin }) {
  const allowedOrigins = parseAllowedOrigins(corsOrigin);

  return {
    origin: (origin, callback) => {
      // Non-browser requests (curl, server-to-server) have no origin.
      if (!origin) {
        return callback(null, true);
      }

      // Development/test: allow all origins for local workflows.
      if (nodeEnv !== 'production') {
        return callback(null, true);
      }

      if (allowedOrigins.length === 0) {
        const error = new Error('CORS rejected: CORS_ORIGIN is required in production');
        error.status = 500;
        return callback(error);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error(`CORS rejected: origin ${origin} not allowed`);
      error.status = 403;
      return callback(error);
    },
    optionsSuccessStatus: 204,
  };
}

export { parseAllowedOrigins };
