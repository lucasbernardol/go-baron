import { NextFunction, Request, Response } from 'express';

import { isCelebrateError, CelebrateError } from 'celebrate';
import { Context, ValidationErrorItem, ValidationError } from 'joi';

type MiddlewareError = CelebrateError | Error;

type Options = {
  status?: number;
  toData?: boolean;
  toDetails?: boolean;
  toSegment?: boolean;
};

type CelebrateDetails = {
  key: string;
  type: string;
  message: string;
  context: Context;
};

/** Util */
const parse = (to: Partial<Options>, obj: Options) => Object.assign(to, obj);

/** @class CelebrateValidation */
class CelebrateValidation {
  private static instance: CelebrateValidation;

  private readonly TARGET_OPTIONS = {
    status: 400,
    toDetails: true,
    toSegment: true,
    toData: true,
  };

  /** @private contructor */
  private constructor() {}

  static getInstance(): CelebrateValidation {
    const celebrateInstanceDoesNotExists = !this.instance;

    if (celebrateInstanceDoesNotExists) {
      this.instance = new CelebrateValidation();
    }

    return this.instance;
  }

  /**
   * - mw
   * @description A custom `celebrate` validation middleware with `Joi`.
   */
  public mw(options: Options = {}) {
    const target = this.TARGET_OPTIONS;

    const { status, toDetails, toSegment, toData } = parse(target, options);

    function normalization(
      JoiDetails: ValidationErrorItem[]
    ): CelebrateDetails[] {
      const JOI_ERROR_DETAILS_JOIN = ',';

      return JoiDetails.map(({ context, path, message, type }) => {
        const key = path.join(JOI_ERROR_DETAILS_JOIN);

        return {
          key,
          type: type.toUpperCase(),
          message,
          context: {
            key: context.key,
            label: context.label,
            value: context.value ?? null,
          },
        };
      });
    }

    /** @function menipulate */
    function menipulate(options: ValidationError, segment: string) {
      const { name, message, details: JoiDetails, _original } = options;

      const details = toDetails ? normalization(JoiDetails) : null;

      /**
       * Keys/example: ['title', 'email', ....]
       */
      const keys: string[] = JoiDetails.reduce((accumulator, item) => {
        const path = item.path;

        return [...accumulator, ...path];
      }, []);

      const object = { name, message, status, segment, keys, details };

      const _data = { _data: _original };

      const exception = toData ? Object.assign(object, _data) : object;

      return { exception };
    }

    return (
      error: MiddlewareError,
      request: Request,
      response: Response,
      next: NextFunction
    ) => {
      const { path, method } = request;

      const isCelebrateOrJoiValidationError = isCelebrateError(error);

      const isCelebrateErrorReverse = !isCelebrateOrJoiValidationError;

      if (isCelebrateErrorReverse) {
        // Call the next "express" middlerare/send Error Object.
        return next(error);
      }

      // Map()
      const celebrateErrorDetails = [...error.details.entries()];

      // At or unix timestamp.
      const at = Math.floor(Date.now() / 1000);

      const _meta = { path, method, at };

      let celebrateException = {};

      for (const [segment, celebrateValidationError] of celebrateErrorDetails) {
        const { exception } = menipulate(celebrateValidationError, segment);

        // @TODO: Add "exception"
        const error = toSegment ? { [segment]: exception } : exception;

        celebrateException = error;
      }

      // Send ERROR.
      response.status(status);

      return response.json({ error: celebrateException, _meta });
    };
  }
}

const celebrateValidation = CelebrateValidation.getInstance();

export { celebrateValidation };
