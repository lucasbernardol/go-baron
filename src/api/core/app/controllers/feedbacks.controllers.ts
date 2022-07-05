import { Request, Response, NextFunction } from 'express';

import { FeedbackServices } from '../services/feedbacks.services';

/** @class  FeedbackController*/
export class FeedbackController {
  public constructor() {}

  async all(request: Request, response: Response, next: NextFunction) {
    try {
      const services = new FeedbackServices();

      const { feedbacks } = await services.all({
        onlyPinned: true, // "allow_pinned: true"
      });

      return response.json({ feedbacks });
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

      return response.json(feedback);
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
        feedback: {
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
