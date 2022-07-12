import { NextFunction, Request, Response } from 'express';

import { isCelebrateError, CelebrateError } from 'celebrate';
import { Context, ValidationErrorItem } from 'joi';

type Err = CelebrateError | Error;

type CelebrateDetails = {
  keys: string;
  type: string;
  message: string;
  context: Context;
};

/** @class CelebrateGuardMiddleware */
export class CelebrateGuardMiddleware {
  constructor() {}

  public normalize(
    detailsErrorItems: ValidationErrorItem[]
  ): CelebrateDetails[] {
    const JOI_ERROR_DETAILS_JOIN = ',';

    const JOI_ERROR_TYPE_SEPARATOR = '.';

    const details = detailsErrorItems.map((error) => {
      const typePartsArray = error.type.split(JOI_ERROR_TYPE_SEPARATOR);

      const type = typePartsArray[typePartsArray.length - 1]; // last string

      // ['title', 'name', ...] => 'title,name',
      const keys = error.path.join(JOI_ERROR_DETAILS_JOIN);

      return {
        keys,
        type,
        message: error.message,
        context: {
          key: error.context.key,
          label: error.context?.label,
          value: error.context.value ?? null,
        },
      };
    });

    return details;
  }

  public mw() {
    return (error: Err, _: Request, response: Response, next: NextFunction) => {
      // Celebrate/validation ERROR.
      const isCelebrateOrJoiValidationError = isCelebrateError(error);

      const isCelebrateErrorReverse = !isCelebrateOrJoiValidationError;

      if (isCelebrateErrorReverse) {
        return next(error);
      }

      const celebrateErrorDetails = [...error.details.entries()];

      console.log({ ...error });

      for (const [segment, celebrateError] of celebrateErrorDetails) {
        const { name, message, isJoi, details, _original } = celebrateError;

        const d = this.normalize(details); // Normalizing

        return response.json({
          error: {
            [segment]: {
              name,
              message,
              d,
            },

            isJoi,
            _original,
          },
        });
      }

      return next(error);
    };
  }
}

const mw = new CelebrateGuardMiddleware();

export { mw };
