import { Router } from 'express';

import { MainController } from '../../app/controllers/main.controllers';

import { HitRouter } from './hits.routes';
import { FeedbackRouter } from './feedbacks.routes';

import { HealthRouter } from './health.routes';

const routes = Router();

const controller = new MainController();

/**
 * @route "/"
 */
routes.get('/', controller.home);

/**
 * @route "/feedbacks"
 */
routes.get('/feedbacks', controller.feedbacks);

/**
 * @route "/api/v1/health"
 */
routes.use('/api/v1', HealthRouter);

/**
 * @route "/api/v1/hits"
 */
routes.use('/api/v1', HitRouter);

/**
 * @route "/api/v1/feedbacks"
 */
routes.use('/api/v1', FeedbackRouter);

/**
 * @route "/*" - Not found
 */
routes.get('*', controller.notFound);

export { routes };
