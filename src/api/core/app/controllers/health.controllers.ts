import { NextFunction, Request, Response } from 'express';
import ms from 'ms';

/** @class HealthController */
export class HealthController {
  public constructor() {}

  async main(request: Request, response: Response, next: NextFunction) {
    try {
      const TIMESTAMP_DIVIDER = 1000;

      const status = 'UP';

      // Up/run time
      const uptime_seconds = Math.floor(process.uptime());

      const uptimeMilliseconds = uptime_seconds * TIMESTAMP_DIVIDER;

      const update_readable = ms(uptimeMilliseconds, {
        long: true,
      });

      // Unix timestamp
      const timestamp = Math.floor(Date.now() / TIMESTAMP_DIVIDER);

      const health = { uptime_seconds, update_readable, timestamp };

      return response.json({ status, health });
    } catch (error) {
      return next(error);
    }
  }
}
