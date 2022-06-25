import express, { Application } from 'express';
import cors from 'cors';

import helmet from 'helmet';
import hpp from 'hpp';

import morgan from 'morgan';

import {
  VIEWS_DIRECTORY,
  STATIC_DIRECTORY,
} from '../../shared/constants/path.constants';
import { isAnyArrayBuffer } from 'util/types';

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
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: false }));

    this.express.use(express.static(STATIC_DIRECTORY));

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

    /**
     * - Client/static files
     */
    this.express.set('view engine', 'ejs');
    this.express.set('views', VIEWS_DIRECTORY);

    this.express.get('/', (_, r) => r.render('main'));

    return this;
  }
}

const Application = ExpressConfiguration.getInstance().init().connect().express;

export { Application };
