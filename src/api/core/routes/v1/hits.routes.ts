import { Router } from 'express';

import { HitController } from '../../app/controllers/hits.controllers';

const controller = new HitController();

const routes = Router();

routes.get('/hits', controller.all);
routes.get('/hits/:id', controller.findByID);

routes.post('/hits', controller.create);

/**
 * - Private HASH
 */
routes.get('/hits/hash/:private', controller.findByPrivateHash);

export { routes as HitRouter };
