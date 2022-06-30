import { NextFunction, Request, Response } from 'express';

import { paginationNormalize } from '../../../../shared/utils/pagination.util';
import { sortingUtil } from '../../../../shared/utils/sorting.util';
import { toNumber } from '../../../../shared/utils/toNumber.util';

import { HitServices } from '../services/hits.services';

type AllRequestQueries = {
  page: number;
  limit: number;
  sort: string;
  order: string;
  q: string;
};

/**
 * @class HitControllers
 */
export class HitController {
  public constructor() {}

  async all(request: Request, response: Response, next: NextFunction) {
    try {
      const { page, limit, sort, order, q } = request.query;

      // @TODO: Pagination, Sorting, Math
      const sorting = sortingUtil({ sort, order });

      const polluted_query = request.queryPolluted;

      const hasPolluted = Object.keys(polluted_query).length >= 1;

      // @TODO: all with "allow_pinned: true"
      const services = new HitServices();

      const { hits, pagination: p } = await services.all({
        onlyHitsPinned: true,
        queries: {
          page: toNumber(page, 1),
          limit: toNumber(limit, 10),
          sorting,
          q,
        },
      });

      const pagination = paginationNormalize({ pagination: p });

      // Object: "_metadata"
      const _meta = {
        pagination,
        polluted_query: hasPolluted ? polluted_query : null,
        sorting,
      };

      return response.json({ hits, _meta });
    } catch (error) {
      return next(error);
    }
  }

  async findByID(request: Request, response: Response, next: NextFunction) {
    try {
      // api/v1/hit/<ObjectID>
      const { id } = request.params;

      const services = new HitServices();

      const { hit } = await services.findByID(id);

      return response.json(hit);
    } catch (error) {
      return next(error);
    }
  }

  async findByPrivateHash(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const { hash } = request.params;

      const services = new HitServices();

      const { hit } = await services.findByPrivateHash(hash);

      return response.json(hit);
    } catch (error) {
      return next(error);
    }
  }

  async create(request: Request, response: Response, next: NextFunction) {
    try {
      // @TODO: Secure body
      const {
        title,
        description,
        website_url,
        website_name,
        allow_set,
        allow_negative,
        allow_pinned,
      } = request.body;

      const services = new HitServices();

      const { hit } = await services.insert({
        title,
        description,
        website_url,
        website_name,
        allow_set,
        allow_negative,
        allow_pinned,
      });

      return response.json(hit);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Using: "public_hash"
   */
  async up(request: Request, response: Response, next: NextFunction) {
    try {
      const { public_hash } = request.params;

      const services = new HitServices();

      const { hits } = await services.up(public_hash);

      return response.json({ hits });
    } catch (error) {
      return next(error);
    }
  }

  async down(request: Request, response: Response, next: NextFunction) {
    try {
      const { public_hash } = request.params;

      const services = new HitServices();

      const { hits } = await services.down(public_hash);

      return response.json({ hits });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Using: "private_hash"
   */
  async set(request: Request, response: Response, next: NextFunction) {
    try {
      const { private_hash } = request.params;

      const { hits } = request.body as { hits: number };

      const services = new HitServices();

      const data = await services.set(private_hash, hits);

      return response.json(data);
    } catch (error) {
      return next(error);
    }
  }

  async delete(request: Request, response: Response, next: NextFunction) {
    try {
      // @TODO: Delete: "/hits/:private_hash"
      const { private_hash } = request.params;

      const services = new HitServices();

      const data = await services.delete(private_hash);

      return response.json(data);
    } catch (error) {
      return next(error);
    }
  }
}
