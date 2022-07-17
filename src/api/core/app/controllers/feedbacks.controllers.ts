import { Request, Response, NextFunction } from 'express';

import { sortingUtil } from '@shared/utils/sorting.util';
import { toNumber } from '@shared/utils/toNumber.util';

import { FeedbackServices } from '../services/feedbacks.services';

/** @class FeedbackController */
export class FeedbackController {
  public constructor() {}

  async all(request: Request, response: Response, next: NextFunction) {
    try {
      const { page, limit, sort, order, q } = request.query;

      // Query pulluted with "HPP".
      const queryPolluted = request.queryPolluted;

      const hasPolluted = Object.keys(queryPolluted).length >= 1;

      const query_pulluted = hasPolluted ? queryPolluted : null;

      // Sorting: "create_at" asc (1)
      const sorting = sortingUtil({ sort, order }, 'created_at');

      // Feedbacks
      const services = new FeedbackServices();

      const { feedbacks, pagination } = await services.all({
        onlyPinned: true, // "allow_pinned: true"
        queries: {
          page: toNumber(page, 1),
          limit: toNumber(limit, 10),
          sorting,
          q: q as string,
        },
      });

      const _meta = { pagination, sorting, query_pulluted };

      return response.json({ feedbacks, _meta });
    } catch (error) {
      return next(error);
    }
  }

  async findByPk(request: Request, response: Response, next: NextFunction) {
    try {
      // Path: "/api/v1/feedbacks/:id"
      const { id } = request.params;

      const services = new FeedbackServices();

      const { feedback } = await services.findByPk(id);

      return response.json(feedback);
    } catch (error) {
      return next(error);
    }
  }

  /** @method create */
  async create(request: Request, response: Response, next: NextFunction) {
    try {
      const {
        title,
        short_description,
        long_description,
        author_name,
        public_email,
        github_username,
        allow_gravatar,
        allow_pinned,
        is_critical,
      } = request.body;

      const services = new FeedbackServices();

      const { feedback } = await services.create({
        title,
        short_description,
        long_description,
        author_name,
        public_email,
        github_username,
        allow_gravatar,
        allow_pinned,
        is_critical,
      });

      //@TODO: Send data with "201"/create HTTP status.

      return response.status(201).json(feedback);
    } catch (error) {
      return next(error);
    }
  }

  /** @method update */
  async update(request: Request, response: Response, next: NextFunction) {
    try {
      // Path: "/api/v1/feedbacks/:id"
      const { id } = request.params;

      const {
        title,
        short_description,
        long_description,
        author_name,
        public_email,
        github_username,
        allow_gravatar,
        allow_pinned,
        is_critical,
      } = request.body;

      const services = new FeedbackServices();

      const { feedback } = await services.update({
        id,
        options: {
          title,
          short_description,
          long_description,
          author_name,
          public_email,
          github_username,
          allow_gravatar,
          allow_pinned,
          is_critical,
        },
      });

      return response.json(feedback);
    } catch (error) {
      return next(error);
    }
  }

  /** @method delete  */
  async delete(request: Request, response: Response, next: NextFunction) {
    try {
      // Path: "/api/v1/feedbacks/:id"
      const { id } = request.params;

      const services = new FeedbackServices();

      const { deleted_count } = await services.delete(id);

      return response.json({ deleted_count });
    } catch (error) {
      return next(error);
    }
  }
}
