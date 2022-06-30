import { Router } from 'express';
import { celebrate } from 'celebrate';

import { HitController } from '../../app/controllers/hits.controllers';

import {
  hitCreationSchema,
  hitUpdateSchema,
} from '../../app/validators/hits.validators';

const controller = new HitController();

const routes = Router();

routes.get('/hits', controller.all);
routes.get('/hits/:id', controller.findByID);
routes.get('/hits/hash/:hash', controller.findByHash);

routes.post('/hits', celebrate({ body: hitCreationSchema }), controller.create);

/**
 * - Use: "public_hash"
 */
routes.patch('/hits/up/:public_hash', controller.up);
routes.patch('/hits/down/:public_hash', controller.down);

/**
 * - Private HASH
 */
routes.patch('/hits/set/:private_hash', controller.set);

routes.put(
  '/hits/:private_hash',
  celebrate({ body: hitUpdateSchema }),
  controller.update
);

routes.delete('/hits/:private_hash', controller.delete);

export { routes as HitRouter };
