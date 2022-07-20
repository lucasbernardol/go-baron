import { createServer, Server as ApplicationServer } from 'http';
import { Application } from 'express';

import { isFunction } from '@shared/utils/isFunction.util';

export type ServerInitOptions = {
  useNativeHTTP?: boolean;
};

type CallbackOptions = {
  port: number;
  timestamp?: number;
  processId: number;
};

export type ServerListenOptions = {
  port?: number;
  serverListenCallback?: ServerListenCallback;
};

export type ServerListenCallback = (options: CallbackOptions) => void;

/** @class ServerConfiguration */
export class ServerConfiguration {
  private _server: ApplicationServer = null;

  private static instance: ServerConfiguration;
  private readonly port: number = 3333;

  private application: Application | ApplicationServer;

  static getInstance(): ServerConfiguration {
    const serverInstanceNotExists = !this.instance;

    if (serverInstanceNotExists) {
      this.instance = new ServerConfiguration();
    }

    return this.instance;
  }

  /** @private constructor */
  private constructor() {}

  /** GET/SET */
  get server(): ApplicationServer {
    return this._server;
  }

  private set server(serverInstance: ApplicationServer) {
    this._server = serverInstance;
  }

  public init(
    application: Application,
    options: ServerInitOptions = {}
  ): ServerConfiguration {
    const { useNativeHTTP = false } = options;

    this.application = useNativeHTTP ? createServer(application) : application;

    return this;
  }

  public listen({
    port = this.port,
    serverListenCallback,
  }: ServerListenOptions = {}) {
    const isCallback = serverListenCallback && isFunction(serverListenCallback);

    // Function: (port: number) => callcack(port);
    const handleCallBackFn = isCallback
      ? (options: CallbackOptions) => serverListenCallback(options)
      : () => console.log(`\nPORT: ${port}`);

    const server = this.application.listen(port, () => {
      const processId: number = process.pid;

      // @TODO: Unix timestamp/ISO string.
      const now = Date.now();

      const timestamp = Math.floor(now / 1000);

      return handleCallBackFn({ port, timestamp, processId });
    });

    // SaveInstance
    this.server = server;

    return server;
  }
}

const Server = ServerConfiguration.getInstance();

export { Server };
