import type { ProjectRole, ProjectStatus } from '../../generated/prisma/enums';

export type ProjectSummary = {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  status: ProjectStatus;
  role: ProjectRole;
  activeAgreementVersionId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectPage = {
  data: ProjectSummary[];
  nextCursor: string | null;
};
