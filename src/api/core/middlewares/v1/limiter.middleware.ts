import limiter, { RateLimitRequestHandler, Options } from 'express-rate-limit';

type LimiterOptions = Partial<Options>;

const OPTIONS_BASE: LimiterOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      name: 'TooManyRequests',
      message: 'Too many requests, please try again later.',
      status: 429,
    },
  },
};

/** @function hitLimiter */
export function createLimiter(
  options: LimiterOptions
): RateLimitRequestHandler {
  const mergedLimiterOptions = Object.assign(OPTIONS_BASE, options);

  return limiter(mergedLimiterOptions);
}
