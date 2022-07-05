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

  public connect() {
    /** middlewares */
    this.express.use(compression());

    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: false }));

    /**
     * - "helmet" Headers
     */
    this.express.use(helmet());

    /** Add cors  */
    this.express.use(cors());

    this.express.use(hpp());

    /**
     * - Morgan
     * HTTP request logger.
     */
    this.express.use(morgan('dev'));

    this.express.use(express.static(STATIC_DIRECTORY));

    /**
     * - Client/static files
     */
    this.express.set('view engine', 'ejs');
    this.express.set('views', VIEWS_DIRECTORY);

    /**
     * Routes
     */
    this.express.use(routes);

    this.express.use(errors());

    return this;
  }
}

const Application = ExpressConfiguration.getInstance().init().connect().express;

export { Application };
