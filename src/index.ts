import 'dotenv/config';

import { App } from './api/main';
import { env } from './api/config/environment.config';

import { connection } from '@data/connections/monk.connection';

/** Run/server */
const server = App.listen({
  port: env.PORT,
  serverListenCallback: (serverEvent) => {
    console.log(JSON.stringify(serverEvent, null, 2));
  },
});

/** GracefulShutdown handler */
async function gracefulShutdown(signal: string): Promise<void> {
  try {
    console.log(`\nSERVER: End with signal code: "${signal}"`);

    async function autoClosing(): Promise<void> {
      await connection.close();

      process.exit(0);
    }

    server.close(autoClosing);
  } catch (error) {
    // An error occured.
    process.exit(1);
  }
}

/** Events */
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('exit', (code) => console.log(`Ended with code: ${code}`));
