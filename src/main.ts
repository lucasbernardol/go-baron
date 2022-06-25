import { Application } from './api/config/express.config';
import { Server } from './api/config/server.config';

/** Bootstrap */
Server.init(Application, {
  allowNativeHTTPServer: true,
}).listen({
  port: 3333,
  // serverListenCallback: (listen) => {
  //   console.log(listen);
  // },
});
