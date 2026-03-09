import { createCorsOptions, parseAllowedOrigins } from '../server/config/cors.js';

function runOriginCheck(corsOptions, origin) {
  return new Promise((resolve, reject) => {
    corsOptions.origin(origin, (err, allowed) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(allowed);
    });
  });
}

describe('CORS config', () => {
  test('parses comma-separated origins with trim and empty filtering', () => {
    expect(parseAllowedOrigins(' http://localhost:5173, ,http://localhost:3001  ,')).toEqual([
      'http://localhost:5173',
      'http://localhost:3001',
    ]);
  });

  test('allows any origin in development', async () => {
    const corsOptions = createCorsOptions({
      nodeEnv: 'development',
      corsOrigin: '',
    });

    await expect(runOriginCheck(corsOptions, 'https://unknown.example.com')).resolves.toBe(true);
  });

  test('allows request with no Origin header', async () => {
    const corsOptions = createCorsOptions({
      nodeEnv: 'production',
      corsOrigin: 'https://app.example.com',
    });

    await expect(runOriginCheck(corsOptions, undefined)).resolves.toBe(true);
  });

  test('allows listed origin in production', async () => {
    const corsOptions = createCorsOptions({
      nodeEnv: 'production',
      corsOrigin: 'https://app.example.com, https://admin.example.com',
    });

    await expect(runOriginCheck(corsOptions, 'https://admin.example.com')).resolves.toBe(true);
  });

  test('rejects non-listed origin in production', async () => {
    const corsOptions = createCorsOptions({
      nodeEnv: 'production',
      corsOrigin: 'https://app.example.com',
    });

    await expect(runOriginCheck(corsOptions, 'https://evil.example.com')).rejects.toMatchObject({
      status: 403,
    });
  });

  test('rejects in production when CORS_ORIGIN is missing', async () => {
    const corsOptions = createCorsOptions({
      nodeEnv: 'production',
      corsOrigin: '',
    });

    await expect(runOriginCheck(corsOptions, 'https://app.example.com')).rejects.toMatchObject({
      status: 500,
    });
  });
});
