import pino from 'pino';
import env from '../config/env.js';

const isDev = env.NODE_ENV === 'development';

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers["api-subscription-key"]',
      'req.headers.cookie',
      'password',
      'token',
      'apiKey',
      'api_key',
      'patientMessage',
      'message',
      'transcript',
      'report',
      'audio',
      'clinicalSummary',
      'body.password',
      'body.message',
      'body.transcript',
      'body.audio'
    ],
    remove: true,
  },
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
