import { Router } from 'express';

import { MainController } from '../../app/controllers/main.controllers';
import { HitRouter } from './hits.routes';

const routes = Router();

const controller = new MainController();

/**
 * @route "/"
 */
routes.get('/', controller.home);

/**
 * @route "/api/v1/hits"
 */
routes.use('/api/v1', HitRouter);

export { routes };
