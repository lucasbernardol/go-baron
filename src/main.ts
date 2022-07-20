import { Application } from '@config/express.config';
import { Server } from '@config/server.config';

/**
 * - Main file/Application bootstramp
 */
export const App = Server.init(Application, {
  useNativeHTTP: true,
});
