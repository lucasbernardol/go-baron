import express, { Application } from 'express';
import { errors } from 'celebrate';
import cors from 'cors';

import compression from 'compression';

import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';

import {
  VIEWS_DIRECTORY,
  STATIC_DIRECTORY,
} from '../../shared/constants/path.constants';

import { compressionFilter } from '../core/middlewares/compression.middleware';
import { mw } from '../core/middlewares/celebrate.middleware';

import { routes } from '../core/routes/v1/proxy.routes';

class ExpressConfiguration {
  private static instance: ExpressConfiguration;

  public express: Application;

  /** @method getInstance */
  static getInstance(): ExpressConfiguration {
    const configInstanceNotExists = !this.instance;

    if (configInstanceNotExists) {
      this.instance = new ExpressConfiguration();
    }

    return this.instance;
  }

  /** @private constructor */
  private constructor() {}

  /**
   * - Express "config".
   * @example
   *  const app = express();
   */
  public init(): ExpressConfiguration {
    if (!this.express) {
      this.express = express();
    }

    return this;
  }

  public connect(): ExpressConfiguration {
    /** middlewares */
    this.express.use(
      compression({
        filter: compressionFilter(),
      })
    );

    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: false }));

    /**
     * - "helmet" Headers
     */
    this.express.use(helmet());

    /** Add cors  */
    this.express.use(cors());

    this.express.use(hpp());

    /** Static files */
    this.staticFolderAndViewsEngine();

    /**
     * - Morgan
     * HTTP request logger.
     */
    this.express.use(morgan('dev'));

    /**
     * Routes
     */
    this.express.use(routes);

    this.express.use(mw.mw());

    this.express.use(errors());

    return this;
  }

  /** @method staticFolderAndViewsEngine */
  private staticFolderAndViewsEngine(): void {
    this.express.use(express.static(STATIC_DIRECTORY));

    /** Client/static files */
    this.express.set('view engine', 'ejs');
    this.express.set('views', VIEWS_DIRECTORY);
  }
}

const Application = ExpressConfiguration.getInstance().init().connect().express;

export { Application };
