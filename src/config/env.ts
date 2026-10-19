import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  HOST: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  JWT_SECRET: z.string().min(32),
  UPLOAD_DIR: z.string().min(1).default('./var/private-uploads'),
  API_DOCS_ENABLED: z.enum(['true', 'false']).default('false'),
  CORS_ORIGINS: z.string().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Konfigurasi environment tidak valid', parsed.error.flatten().fieldErrors);
  throw new Error('Konfigurasi environment tidak valid');
}

export const env = {
  ...parsed.data,
  API_DOCS_ENABLED: parsed.data.API_DOCS_ENABLED === 'true',
  CORS_ORIGINS: parsed.data.CORS_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};
