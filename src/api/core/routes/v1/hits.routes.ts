import { Router } from 'express';
import { celebrate } from 'celebrate';

import {
  HITS_RATE_LIMIT_MILLISECONDS,
  HITS_MAX_REQUESTS,
} from '@shared/constants/numbers.constants';

import { HitController } from '../../app/controllers/hits.controllers';
import { createLimiter } from '../../middlewares/v1/limiter.middleware';

import {
  hitCreationSchema,
  hitUpdateSchema,
  hitSetSchema,
} from '../../app/validators/hits.validators';

const controller = new HitController();

const routes = Router();

/**
 * @see https://www.npmjs.com/package/express-rate-limit
 **/
const limiter = createLimiter({
  windowMs: HITS_RATE_LIMIT_MILLISECONDS,
  max: HITS_MAX_REQUESTS,
});

routes.get('/hits', controller.all);
routes.get('/hits/:id', limiter, controller.findByID);
routes.get('/hits/hash/:hash', limiter, controller.findByHash);

routes.post(
  '/hits',
  limiter,
  celebrate({ body: hitCreationSchema }),
  controller.create
);

/**
 * - Use: "public_hash"
 */
routes.patch('/hits/up/:public_hash', controller.up);
routes.patch('/hits/down/:public_hash', controller.down);

/**
 * - Use: "private_hash"
 */
routes.patch(
  '/hits/set/:private_hash',
  limiter,
  celebrate({ body: hitSetSchema }),
  controller.set
);

routes.put(
  '/hits/:private_hash',
  limiter,
  celebrate({ body: hitUpdateSchema }),
  controller.update
);

routes.delete('/hits/:private_hash', limiter, controller.delete);

export { routes as HitRouter };
