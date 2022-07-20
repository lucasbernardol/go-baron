import 'dotenv/config';

import { App } from '@boot/app.boot';
import { env } from '@config/environment.config';

import { connection } from '@data/connections/monk.connection';

/** Server load */
const server = App.listen({
  port: env.PORT, // PORT: 3333
  serverListenCallback: ({ timestamp, processId, port }) => {
    console.log(`
      PORT: ${port}
      TIMESTAMP: ${timestamp} - PID: ${processId}
    `);
  },
});

type Signals = {
  forceExitCode: number;
  exitCode: number;
};

const SIGNALS_CODES: Signals = {
  exitCode: 0,
  forceExitCode: 1,
};

/**
 * - Graceful shutdown/simple concept,
 */
async function gracefulShutdown(signal: string): Promise<void> {
  try {
    console.log(`\nSERVER: End process with received signal/code: "${signal}"`);

    // @TODO: Server listening?
    const applicationOffListening = !server.listening;

    if (applicationOffListening) {
      return process.exit(SIGNALS_CODES.forceExitCode);
    }

    // @TODO: Close application/express API.
    async function closingHandler(error?: Error): Promise<void> {
      // Error on server/closing
      if (error) {
        return process.exit(SIGNALS_CODES.forceExitCode);
      }

      await connection.close();

      process.exit(SIGNALS_CODES.exitCode);
    }

    server.close(closingHandler);
  } catch (error) {
    console.error(error);

    // An error occurent.
    process.exit(SIGNALS_CODES.forceExitCode);
  }
}

/** Events  */
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('exit', (code) => console.log(`\nEXIT: code: ${code}`));
