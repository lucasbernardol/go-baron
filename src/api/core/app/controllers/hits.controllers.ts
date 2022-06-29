import { NextFunction, Request, Response } from 'express';

import { HitServices } from '../services/hits.services';

/**
 * @class HitControllers
 */
export class HitController {
  public constructor() {}

  async all(request: Request, response: Response, next: NextFunction) {
    try {
      const services = new HitServices();

      // @TODO: all with "allow_pinned: true"
      const { hits } = await services.all({
        onlyHitsPinned: true,
      });

      return response.json(hits);
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
      const { private: hash } = request.params;

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
}
