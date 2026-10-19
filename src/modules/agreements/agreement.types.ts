import type { AgreementStatus } from '../../generated/prisma/enums';
import type { AgreementSnapshot } from './agreement.schema';

export type AgreementVersionView = AgreementSnapshot & {
  id: string;
  projectId: string;
  versionNumber: number;
  status: AgreementStatus;
  contentHash: string;
  baseAgreementVersionId: string | null;
  createdById: string;
  rejectedById: string | null;
  rejectionReason: string | null;
  reviewedAt: Date | null;
  approvalCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type AgreementVersionPage = {
  data: AgreementVersionView[];
  nextCursor: string | null;
};

export type EditableAgreementContext = {
  agreement: AgreementVersionView;
  memberRole: 'FREELANCER' | 'CLIENT';
};
