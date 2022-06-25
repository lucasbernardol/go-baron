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
}
