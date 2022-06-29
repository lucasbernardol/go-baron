import { Router } from 'express';

import { HitController } from '../../app/controllers/hits.controllers';

const controller = new HitController();

const routes = Router();

routes.get('/hits', controller.all);
routes.get('/hits/:id', controller.findByID);
routes.get('/hits/hash/:hash', controller.findByPrivateHash);

routes.post('/hits', controller.create);

/**
 * - Use: "public_hash"
 */
routes.patch('/hits/up/:public_hash', controller.up);
routes.patch('/hits/down/:public_hash', controller.down);

/**
 * - Private HASH
 */
routes.patch('/hits/set/:private_hash', controller.set);
routes.delete('/hits/:private_hash', controller.delete);

export { routes as HitRouter };
