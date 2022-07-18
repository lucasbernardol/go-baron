import { Router } from 'express';
import { celebrate } from 'celebrate';

import {
  MAX_REQUESTS,
  RATE_LIMIT_MILLISECONDS,
} from '@shared/constants/numbers.constants';

import { FeedbackController } from '../../app/controllers/feedbacks.controllers';
import { createLimiter } from '../../middlewares/v1/limiter.middleware';

import {
  createFeedbackSchema,
  updateFeedbackSchema,
} from '../../app/validators/feedbacks.validators';

const routes = Router();

const controller = new FeedbackController();

const limiter = createLimiter({
  windowMs: RATE_LIMIT_MILLISECONDS,
  max: MAX_REQUESTS,
});

routes.get('/feedbacks', controller.all);
routes.get('/feedbacks/:id', limiter, controller.findByPk);

routes.post(
  '/feedbacks',
  limiter,
  celebrate({ body: createFeedbackSchema }),
  controller.create
);

routes.put(
  '/feedbacks/:id',
  limiter,
  celebrate({ body: updateFeedbackSchema }),
  controller.update
);

routes.delete('/feedbacks/:id', limiter, controller.delete);

export { routes as FeedbackRouter };
