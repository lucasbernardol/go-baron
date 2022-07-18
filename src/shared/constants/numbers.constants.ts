export const MILLISECONDS_MULTI = 1000;

export const RATE_LIMIT_MILLISECONDS = 2 * 60 * 1000;

export const MAX_REQUESTS = 200;

/**
 * - 10 hits per minutes
 *
 * 1 minute:  1 * 60 * 1000 => 60 * 1000 => 60000
 * 5 minutes: 5 * 60 * 1000 => 60000 * 5 => 300000
 */
export const HITS_RATE_LIMIT_MILLISECONDS = 1 * 60 * 1000;

export const HITS_MAX_REQUESTS = 10;
