import { createServer, Server as HTTPServer } from 'http';

import { Application } from 'express';

import { isFunction } from '../../shared/utils/isFunction.util';

type CallbackOptions = {
  port: number;
  at?: number;
};

export type ServerListenCallback = (options: CallbackOptions) => void;

export type ServerInitOptions = {
  allowNativeHTTPServer?: boolean;
};

export type ServerListenOptions = {
  port?: number;
  serverListenCallback?: ServerListenCallback;
};

export class ServerConfiguration {
  private static instance: ServerConfiguration;

  private port: number = 3333;

  private application: Application | HTTPServer;

  static getInstance(): ServerConfiguration {
    const serverInstanceNotExists = !this.instance;

    if (serverInstanceNotExists) {
      this.instance = new ServerConfiguration();
    }

    return this.instance;
  }

  /** @private constructor */
  private constructor() {}

  public init(
    application: Application,
    options: ServerInitOptions = {}
  ): ServerConfiguration {
    const { allowNativeHTTPServer = false } = options;

    this.application = allowNativeHTTPServer
      ? createServer(application)
      : application;

    return this;
  }

  public listen({
    port = this.port,
    serverListenCallback,
  }: ServerListenOptions = {}) {
    const isCallbackFunction =
      serverListenCallback && isFunction(serverListenCallback);

    // Function: (port: number) => callcack(port);
    const handleCallBackFn = isCallbackFunction
      ? (port: number, at?: number) => serverListenCallback({ port, at })
      : () => console.log(`\nPORT: ${port}`);

    this.application.listen(port, () => {
      const at = Math.floor(Date.now() / 1000); // Unix Date

      return handleCallBackFn(port, at);
    });
  }
}

const Server = ServerConfiguration.getInstance();

export { Server };
