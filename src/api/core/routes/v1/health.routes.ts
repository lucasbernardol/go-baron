import { Router } from 'express';

import { HealthController } from '../../app/controllers/health.controllers';

const routes = Router();

const controller = new HealthController();

routes.get('/health', controller.main);

export { routes as HealthRouter };
