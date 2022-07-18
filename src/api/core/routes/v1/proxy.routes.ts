import { Router } from 'express';

import { MainController } from '../../app/controllers/main.controllers';
import { createLimiter } from '../../middlewares/v1/limiter.middleware';

import { HitRouter } from './hits.routes';
import { FeedbackRouter } from './feedbacks.routes';
import { HealthRouter } from './health.routes';

const routes = Router();

const controller = new MainController();

/**
 * - Express rate limiter/global request limiter/per IP.
 */
const limiter = createLimiter({
  windowMs: 1 * 60 * 60 * 1000, // 1 hour
  max: 1500,
});

routes.use(limiter);

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
