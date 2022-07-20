import { Application } from '@config/express.config';
import { Server } from '@config/server.config';

/**
 * - BootStamp/config
 */
export const App = Server.init(Application, { useNativeHTTP: true });
