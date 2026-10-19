import { z } from 'zod';

export const invitationProjectParamsSchema = z
  .object({
    projectId: z.string().uuid('Project ID tidak valid'),
  })
  .strict();

export const createInvitationSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, 'Email wajib diisi')
      .max(254, 'Email terlalu panjang')
      .email('Format email tidak valid')
      .transform((email) => email.toLowerCase()),
  })
  .strict();

export const acceptInvitationSchema = z
  .object({
    token: z
      .string()
      .regex(/^[A-Za-z0-9_-]{43}$/, 'Token undangan tidak valid'),
  })
  .strict();

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
