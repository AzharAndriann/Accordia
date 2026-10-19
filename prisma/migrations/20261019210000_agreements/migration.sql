-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM (
    'DRAFT',
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'WITHDRAWN'
);

-- CreateTable
CREATE TABLE "AgreementVersion" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "status" "AgreementStatus" NOT NULL DEFAULT 'DRAFT',
    "scope" TEXT NOT NULL,
    "deliverables" TEXT[],
    "amountRupiah" DECIMAL(18,0) NOT NULL,
    "deadline" DATE NOT NULL,
    "revisionLimit" INTEGER NOT NULL,
    "cancellationTerms" TEXT NOT NULL,
    "ipTerms" TEXT NOT NULL,
    "contentHash" CHAR(64) NOT NULL,
    "baseAgreementVersionId" UUID,
    "createdById" UUID NOT NULL,
    "rejectedById" UUID,
    "rejectionReason" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgreementVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgreementApproval" (
    "id" UUID NOT NULL,
    "versionId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgreementApproval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgreementVersion_projectId_versionNumber_key"
ON "AgreementVersion"("projectId", "versionNumber");

-- CreateIndex
CREATE INDEX "AgreementVersion_projectId_status_idx"
ON "AgreementVersion"("projectId", "status");

-- CreateIndex
CREATE INDEX "AgreementVersion_createdById_idx"
ON "AgreementVersion"("createdById");

-- CreateIndex: database-level guard for one pending version per project
CREATE UNIQUE INDEX "AgreementVersion_one_pending_per_project"
ON "AgreementVersion"("projectId") WHERE "status" = 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "AgreementApproval_versionId_userId_key"
ON "AgreementApproval"("versionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_activeAgreementVersionId_key"
ON "Project"("activeAgreementVersionId");

-- CreateIndex
CREATE INDEX "AgreementApproval_userId_idx"
ON "AgreementApproval"("userId");

-- AddForeignKey
ALTER TABLE "AgreementVersion"
ADD CONSTRAINT "AgreementVersion_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgreementVersion"
ADD CONSTRAINT "AgreementVersion_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgreementVersion"
ADD CONSTRAINT "AgreementVersion_rejectedById_fkey"
FOREIGN KEY ("rejectedById") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgreementApproval"
ADD CONSTRAINT "AgreementApproval_versionId_fkey"
FOREIGN KEY ("versionId") REFERENCES "AgreementVersion"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgreementApproval"
ADD CONSTRAINT "AgreementApproval_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project"
ADD CONSTRAINT "Project_activeAgreementVersionId_fkey"
FOREIGN KEY ("activeAgreementVersionId") REFERENCES "AgreementVersion"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
