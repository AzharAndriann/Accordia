-- CreateTable
CREATE TABLE "Invitation" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "targetEmail" VARCHAR(254) NOT NULL,
    "tokenHash" CHAR(64) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "inviterId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_tokenHash_key" ON "Invitation"("tokenHash");

-- CreateIndex
CREATE INDEX "Invitation_projectId_targetEmail_idx"
ON "Invitation"("projectId", "targetEmail");

-- CreateIndex
CREATE INDEX "Invitation_expiresAt_idx" ON "Invitation"("expiresAt");

-- AddForeignKey
ALTER TABLE "Invitation"
ADD CONSTRAINT "Invitation_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation"
ADD CONSTRAINT "Invitation_inviterId_fkey"
FOREIGN KEY ("inviterId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
