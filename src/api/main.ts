import { Application } from './config/express.config';
import { Server } from './config/server.config';

/** Bootstrap */
export const App = Server.init(Application, { useNativeHTTP: true });
