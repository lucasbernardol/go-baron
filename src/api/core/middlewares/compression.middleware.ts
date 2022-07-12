import { Request, Response } from 'express';
import compression from 'compression';

import { COMPRESSION_HEADER_IGNORE } from '../../../shared/constants/headers.constants';

type CompressionFilter = (request: Request, response: Response) => boolean;

/** @function compressionFilter */
export function compressionFilter(): CompressionFilter {
  return (request: Request, response: Response) => {
    const compressionIgnore = request.get(COMPRESSION_HEADER_IGNORE);

    if (compressionIgnore) {
      // Ignore "g-zip" compression
      return false;
    }

    return compression.filter(request, response);
  };
}
