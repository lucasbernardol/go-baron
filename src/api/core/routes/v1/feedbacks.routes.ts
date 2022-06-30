import { Router } from 'express';

import { FeedbackController } from '../../app/controllers/feedbacks.controllers';

const routes = Router();

const controller = new FeedbackController();

routes.get('/feedbacks', controller.all);
routes.get('/feedbacks/:id', controller.findByPk);

routes.post('/feedbacks', controller.create);
routes.delete('/feedbacks/:id', controller.delete);

export { routes as FeedbackRouter };
