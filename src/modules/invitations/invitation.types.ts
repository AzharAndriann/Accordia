import type { ProjectRole } from '../../generated/prisma/enums';

export type CreatedInvitation = {
  id: string;
  projectId: string;
  targetEmail: string;
  expiresAt: Date;
  createdAt: Date;
  token: string;
};

export type AcceptedInvitation = {
  invitationId: string;
  projectId: string;
  role: ProjectRole;
  acceptedAt: Date;
};
