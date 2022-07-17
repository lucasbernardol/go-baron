import express, { Application } from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import hpp, { Options as HppOptions } from 'hpp';
import morgan from 'morgan';
import icon from 'serve-favicon';

import {
  VIEWS_DIRECTORY,
  STATIC_DIRECTORY,
  HAT_FAVICON_PATH,
} from '@shared/constants/path.constants';

import { compressionFilter } from '../core/middlewares/v1/compression.middleware';
import { celebrateValidation } from '../core/middlewares/v1/celebrate.middleware';

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

  private options: Record<string, any> = {
    compresison: {
      filter: compressionFilter(),
    },

    hpp: {
      checkBody: false,
    } as HppOptions,
  };

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
    this.express.use(compression(this.options.compression));

    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: false }));

    /**
     * - "helmet" Headers
     */
    this.express.use(helmet());

    /** Add cors  */
    this.express.use(cors());

    /**
     * - HTTP Parameter Pollution attacks
     * @see https://www.npmjs.com/package/hpp
     */
    const hppOptions = { ...this.options.hpp };

    this.express.use(hpp(hppOptions));

    /** Static files */
    this.staticFolderAndViewsEngine();

    /**
     * - Morgan
     * HTTP request logger.
     */
    this.express.use(morgan('dev'));

    /**
     * Proxy: Heroku
     */
    this.express.set('trust proxy', true);

    /** Routes */
    this.express.use(icon(HAT_FAVICON_PATH));

    this.express.use(routes);

    /**
     * Catch/Error middleweares
     */
    this.express.use(celebrateValidation.mw());

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
