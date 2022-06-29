import { NextFunction, Request, Response } from 'express';
import { ServerResponse } from 'http';
import { Server } from '../../../config/server.config';

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
