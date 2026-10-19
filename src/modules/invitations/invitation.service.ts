import { ProjectRole } from '../../generated/prisma/enums';
import { AppError } from '../../shared/errors';
import type {
  AcceptInvitationInput,
  CreateInvitationInput,
} from './invitation.schema';
import type { InvitationRepository } from './invitation.repository';
import { createInvitationToken, hashInvitationToken } from './invitation.tokens';
import type { AcceptedInvitation, CreatedInvitation } from './invitation.types';

const invitationLifetimeMs = 48 * 60 * 60 * 1_000;

export function createInvitationService(repository: InvitationRepository) {
  return {
    async create(
      inviterId: string,
      projectId: string,
      input: CreateInvitationInput,
      now = new Date(),
    ): Promise<CreatedInvitation> {
      const context = await repository.getCreationContext(projectId, inviterId);

      if (!context) {
        throw new AppError(404, 'PROJECT_NOT_FOUND', 'Proyek tidak ditemukan');
      }
      if (context.inviterRole !== ProjectRole.FREELANCER) {
        throw new AppError(
          403,
          'FORBIDDEN',
          'Hanya freelancer yang dapat mengundang klien',
        );
      }
      if (context.memberCount >= 2) {
        throw new AppError(
          409,
          'PROJECT_MEMBER_LIMIT_REACHED',
          'Proyek sudah memiliki jumlah anggota maksimum',
        );
      }
      if (context.memberEmails.includes(input.email)) {
        throw new AppError(
          409,
          'ALREADY_PROJECT_MEMBER',
          'Email sudah menjadi anggota proyek',
        );
      }

      const token = createInvitationToken();
      const expiresAt = new Date(now.getTime() + invitationLifetimeMs);
      const invitation = await repository.create({
        projectId,
        inviterId,
        targetEmail: input.email,
        tokenHash: hashInvitationToken(token),
        expiresAt,
      });

      return { ...invitation, token };
    },

    accept(
      userId: string,
      input: AcceptInvitationInput,
      now = new Date(),
    ): Promise<AcceptedInvitation> {
      return repository.accept({
        userId,
        tokenHash: hashInvitationToken(input.token),
        now,
      });
    },
  };
}

export type InvitationService = ReturnType<typeof createInvitationService>;
