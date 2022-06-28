import { Request, Response, NextFunction } from 'express';

/** @class MainController */
export class MainController {
  public constructor() {}

  async home(request: Request, response: Response, next: NextFunction) {
    try {
      // @TODO: Render "home" page.
      const template = 'main';

      return response.render(template);
    } catch (error) {
      return next(error);
    }
  }

  async renderNotFoundTemplate(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const templateName = '404';

      return response.render(templateName);
    } catch (error) {
      return next(error);
    }
  }
}
