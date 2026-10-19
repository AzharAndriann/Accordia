import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { openApiDocument } from './docs/openapi';
import { prisma } from './lib/prisma';

type ReadinessDatabase = {
  $queryRaw(query: TemplateStringsArray): Promise<unknown>;
};

export function createApp(database: ReadinessDatabase = prisma) {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.use(cors({ origin: env.CORS_ORIGINS }));

  app.get('/api/v1/health', (_req, res) => {
    res.json({ data: { status: 'ok' } });
  });

  app.get('/api/v1/ready', async (_req, res) => {
    try {
      await database.$queryRaw`SELECT 1`;
      res.json({ data: { status: 'ready' } });
    } catch {
      res.status(503).json({
        error: { code: 'NOT_READY', message: 'Database belum siap' },
      });
    }
  });

  if (env.API_DOCS_ENABLED) {
    app.get('/openapi.json', (_req, res) => res.json(openApiDocument));
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(openApiDocument, {
        swaggerOptions: { persistAuthorization: false },
      }),
    );
  }

  app.use((_req, res) => {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Endpoint tidak ditemukan' },
    });
  });

  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    const status =
      error?.type === 'entity.too.large'
        ? 413
        : error?.type === 'entity.parse.failed'
          ? 400
          : 500;

    res.status(status).json({
      error: {
        code:
          status === 413
            ? 'PAYLOAD_TOO_LARGE'
            : status === 400
              ? 'INVALID_JSON'
              : 'INTERNAL_ERROR',
        message: status === 500 ? 'Terjadi kesalahan server' : 'Request tidak valid',
      },
    });
  };

  app.use(errorHandler);

  return app;
}
