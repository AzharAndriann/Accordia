const statusResponse = {
  type: 'object',
  required: ['data'],
  properties: {
    data: {
      type: 'object',
      required: ['status'],
      properties: { status: { type: 'string' } },
    },
  },
};

const errorResponse = {
  type: 'object',
  required: ['error'],
  properties: {
    error: {
      type: 'object',
      required: ['code', 'message'],
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
      },
    },
  },
};

export const openApiDocument = {
  openapi: '3.0.3',
  info: { title: 'Accordia API', version: '0.1.0' },
  servers: [{ url: '/api/v1' }],
  components: {
    schemas: { Error: errorResponse },
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  paths: {
    '/health': {
      get: {
        operationId: 'getHealth',
        tags: ['System'],
        security: [],
        summary: 'Memeriksa proses API',
        responses: {
          '200': {
            description: 'API berjalan',
            content: {
              'application/json': {
                schema: statusResponse,
                example: { data: { status: 'ok' } },
              },
            },
          },
        },
      },
    },
    '/ready': {
      get: {
        operationId: 'getReadiness',
        tags: ['System'],
        security: [],
        summary: 'Memeriksa koneksi database',
        responses: {
          '200': {
            description: 'Database siap',
            content: {
              'application/json': {
                schema: statusResponse,
                example: { data: { status: 'ready' } },
              },
            },
          },
          '503': {
            description: 'Database belum siap',
            content: {
              'application/json': {
                schema: errorResponse,
                example: {
                  error: { code: 'NOT_READY', message: 'Database belum siap' },
                },
              },
            },
          },
        },
      },
    },
  },
};
