import { NextFunction, Request, Response } from 'express';
import { isHttpError, HttpError } from 'http-errors';

export type RequestMeta = {
  method: string;
  path: string;
  protocol: string;
  secure: boolean;
  timestamp: number;
};

/** @function guard  */
export function guard() {
  return async (
    error: HttpError | Error,
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const isHttpException = isHttpError(error);

    const isInternalServerError = !isHttpException;

    // @TODO: Internal HTTP Error.
    if (isInternalServerError) {
      // An error occured.
      const internalError = {
        name: 'InternalServerError',
        message: 'Internal Server Error.',
        status: 500,
      };

      return response.status(500).json({ error: internalError });
    }

    const { method, path, protocol, secure } = request;

    const { name, status, message } = error;

    //@TODO:  Unix timestamp
    const timestamp = Math.floor(Date.now() / 1000);

    const _meta: RequestMeta = { method, path, protocol, secure, timestamp };

    const exception = { name, status, message, _meta };

    // @TODO: Send ERROR/response

    return response.status(status).json({ error: exception });
  };
}
