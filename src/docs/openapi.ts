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

const userResponse = {
  type: 'object',
  required: ['id', 'email', 'name', 'emailVerifiedAt', 'createdAt'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    email: { type: 'string', format: 'email' },
    name: { type: 'string' },
    emailVerifiedAt: { type: 'string', format: 'date-time', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

const authResponse = {
  type: 'object',
  required: ['data'],
  properties: {
    data: {
      type: 'object',
      required: ['user', 'accessToken', 'refreshToken', 'tokenType', 'expiresIn'],
      properties: {
        user: userResponse,
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        tokenType: { type: 'string', enum: ['Bearer'] },
        expiresIn: { type: 'integer', example: 900 },
      },
    },
  },
};

export const openApiDocument = {
  openapi: '3.0.3',
  info: { title: 'Accordia API', version: '0.1.0' },
  servers: [{ url: '/api/v1' }],
  components: {
    schemas: {
      Error: errorResponse,
      User: userResponse,
      AuthResponse: authResponse,
    },
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
    '/auth/register': {
      post: {
        operationId: 'register',
        tags: ['Auth'],
        security: [],
        summary: 'Mendaftarkan akun baru',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                additionalProperties: false,
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', minLength: 2, maxLength: 100 },
                  email: { type: 'string', format: 'email', maxLength: 254 },
                  password: { type: 'string', minLength: 12, maxLength: 128 },
                },
              },
              example: {
                name: 'Budi Santoso',
                email: 'budi@example.com',
                password: 'contoh-password-kuat',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Akun dan sesi berhasil dibuat',
            content: { 'application/json': { schema: authResponse } },
          },
          '409': {
            description: 'Email sudah terdaftar',
            content: { 'application/json': { schema: errorResponse } },
          },
          '422': {
            description: 'Input tidak valid',
            content: { 'application/json': { schema: errorResponse } },
          },
          '429': {
            description: 'Terlalu banyak percobaan',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        operationId: 'login',
        tags: ['Auth'],
        security: [],
        summary: 'Masuk menggunakan email dan password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                additionalProperties: false,
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', maxLength: 254 },
                  password: { type: 'string', minLength: 1, maxLength: 128 },
                },
              },
              example: {
                email: 'budi@example.com',
                password: 'contoh-password-kuat',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login berhasil',
            content: { 'application/json': { schema: authResponse } },
          },
          '401': {
            description: 'Kredensial salah',
            content: { 'application/json': { schema: errorResponse } },
          },
          '422': {
            description: 'Input tidak valid',
            content: { 'application/json': { schema: errorResponse } },
          },
          '429': {
            description: 'Terlalu banyak percobaan',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
    },
  },
};
