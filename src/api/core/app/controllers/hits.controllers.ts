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
        onlyPinned: true,
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
      // Path: api/v1/hits/:id
      const { id } = request.params;

      const services = new HitServices();

      const { hit } = await services.findByID(id);

      return response.json(hit);
    } catch (error) {
      return next(error);
    }
  }

  async findByHash(request: Request, response: Response, next: NextFunction) {
    try {
      // Path: api/v1/hit/hash/:hash ("private_hash")
      const { hash } = request.params;

      const services = new HitServices();

      const { hit } = await services.findByPrivateHash(hash);

      return response.json(hit);
    } catch (error) {
      return next(error);
    }
  }

  /** @method create */
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

      const { hit } = await services.create({
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

  async update(request: Request, response: Response, next: NextFunction) {
    try {
      // Path: /api/v1/hits/:private_hash
      const { private_hash } = request.params;

      const {
        title,
        description,
        website_name,
        website_url,
        allow_set,
        allow_negative,
        allow_pinned,
      } = request.body;

      const services = new HitServices();

      const { updated_count } = await services.update({
        private_hash,
        options: {
          title,
          description,
          website_name,
          website_url,
          allow_set,
          allow_negative,
          allow_pinned,
        },
      });

      return response.json({ updated_count });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Use: "public_hash"
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
   * Use: "private_hash"
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
      // Path: "/hits/:private_hash"
      const { private_hash } = request.params;

      const services = new HitServices();

      const data = await services.delete(private_hash);

      return response.json(data);
    } catch (error) {
      return next(error);
    }
  }
}
