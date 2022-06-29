export type EnvironmentVariables = {
  PORT: number;
  HOST: string;
  DATABASE_URI: string;
};

export const env: EnvironmentVariables = {
  DATABASE_URI: process.env.DATABASE_URI,
  PORT: Number(process.env.PORT) || 3333,
  HOST: process.env.HOST || 'http://localhost:3333',
};
