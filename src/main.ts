import 'dotenv/config';

import { Application } from './api/config/express.config';
import { Server } from './api/config/server.config';

import { env } from './api/config/environment.config';

/** Bootstrap */
Server.init(Application, {
  allowNativeHTTPServer: true,
}).listen({
  port: env.PORT,
  // serverListenCallback: (listen) => {
  //   console.log(listen);
  // },
});
