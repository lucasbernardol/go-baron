import { Router } from 'express';
import { celebrate } from 'celebrate';

import { FeedbackController } from '../../app/controllers/feedbacks.controllers';

import {
  createFeedbackSchema,
  updateFeedbackSchema,
} from '../../app/validators/feedbacks.validators';

const routes = Router();

const controller = new FeedbackController();

routes.get('/feedbacks', controller.all);
routes.get('/feedbacks/:id', controller.findByPk);

routes.post(
  '/feedbacks',
  celebrate({ body: createFeedbackSchema }),
  controller.create
);

routes.put(
  '/feedbacks/:id',
  celebrate({ body: updateFeedbackSchema }),
  controller.update
);

routes.delete('/feedbacks/:id', controller.delete);

export { routes as FeedbackRouter };
