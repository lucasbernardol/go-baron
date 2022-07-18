import { NextFunction, Request, Response } from 'express';
import ms from 'ms';

import { MILLISECONDS_MULTI } from '@shared/constants/numbers.constants';

export type ProcessTimeOutput = {
  uptime_seconds: number;
  uptime_milliseconds?: number;
  uptime_readable: string;
};

function processTime(): ProcessTimeOutput {
  const uptime = process.uptime(); // Node.js process time.

  const uptime_seconds = Math.floor(uptime);

  const uptime_milliseconds = Math.floor(uptime_seconds * MILLISECONDS_MULTI);

  const uptime_readable = ms(uptime_milliseconds, { long: true });

  return { uptime_seconds, uptime_milliseconds, uptime_readable };
}

/** @class HealthController */
export class HealthController {
  public constructor() {}

  async main(_: Request, response: Response, next: NextFunction) {
    try {
      const status = 'UP';

      // Unix timestamp
      const request_timestamp = Math.floor(Date.now() / MILLISECONDS_MULTI);

      // Up/run time
      const uptime = processTime();

      const health = { uptime };

      return response.json({ status, health, request_timestamp });
    } catch (error) {
      return next(error);
    }
  }
}
