import { z } from 'zod';

export const createProjectSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, 'Judul minimal 3 karakter')
      .max(160, 'Judul maksimal 160 karakter'),
    description: z
      .string()
      .trim()
      .min(1, 'Deskripsi wajib diisi')
      .max(5_000, 'Deskripsi maksimal 5000 karakter'),
  })
  .strict();

export const listProjectsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    cursor: z.string().uuid('Cursor tidak valid').optional(),
  })
  .strict();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
