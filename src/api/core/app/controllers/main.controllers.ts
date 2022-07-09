import { Request, Response, NextFunction } from 'express';

import {
  MAIN_TEMPLATE_NAME,
  NOT_FOUND_TEMPLATE_NAME,
  FEEDBACKS_TEMPLATE_NAME,
} from '../../../../shared/constants/views.constants';

/** @class MainController */
export class MainController {
  public constructor() {}

  async home(request: Request, response: Response, next: NextFunction) {
    try {
      // @TODO: Render "home" page.
      const template = MAIN_TEMPLATE_NAME;

      return response.render(template);
    } catch (error) {
      return next(error);
    }
  }

  async feedbacks(request: Request, response: Response, next: NextFunction) {
    try {
      // file "feedbacks.ejs"
      //response.setHeader('Content-Security-Policy', '*');
      response.set({
        'Content-Security-Policy': '',
        'Cross-Origin-Embedder-Policy': '',
        'Cross-Origin-Opener-Policy': '',
      });

      return response.render(FEEDBACKS_TEMPLATE_NAME);
    } catch (error) {
      return next(error);
    }
  }

  async notFound(_: Request, response: Response, next: NextFunction) {
    try {
      // file: "404.ejs"
      return response.render(NOT_FOUND_TEMPLATE_NAME);
    } catch (error) {
      return next(error);
    }
  }
}
