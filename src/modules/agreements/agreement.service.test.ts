import { describe, expect, test } from 'bun:test';
import { AgreementStatus, ProjectRole } from '../../generated/prisma/enums';
import type { AgreementRepository } from './agreement.repository';
import { agreementSnapshotSchema } from './agreement.schema';
import { createAgreementService } from './agreement.service';
import { hashAgreementSnapshot } from './agreement.snapshot';
import type { AgreementVersionView } from './agreement.types';

const userId = 'e48908f0-69f3-4da4-b9bd-3df4ac033f50';
const projectId = '6b79fc7b-2a72-49eb-99f6-184267581142';
const versionId = 'd74e2db6-7539-4fd9-8463-d3cc414f5646';
const timestamp = new Date('2026-10-19T00:00:00.000Z');

const snapshot = agreementSnapshotSchema.parse({
  scope: 'Website profil perusahaan',
  deliverables: ['Lima halaman responsif', 'Source code'],
  amountRupiah: '3000000',
  deadline: '2026-12-01',
  revisionLimit: 2,
  cancellationTerms: 'Pembatalan mengikuti progres pekerjaan.',
  ipTerms: 'Hak penggunaan diberikan setelah pembayaran.',
});

const agreement: AgreementVersionView = {
  id: versionId,
  projectId,
  versionNumber: 1,
  status: AgreementStatus.DRAFT,
  ...snapshot,
  contentHash: hashAgreementSnapshot(snapshot),
  baseAgreementVersionId: null,
  createdById: userId,
  rejectedById: null,
  rejectionReason: null,
  reviewedAt: null,
  approvalCount: 0,
  createdAt: timestamp,
  updatedAt: timestamp,
};

function createRepositoryMock() {
  let createdInput: Parameters<AgreementRepository['createDraft']>[0] | undefined;
  let updatedInput: Parameters<AgreementRepository['updateDraft']>[0] | undefined;

  const repository: AgreementRepository = {
    async createDraft(input) {
      createdInput = input;
      return { ...agreement, contentHash: input.contentHash };
    },
    async listForProject() {
      return { data: [agreement], nextCursor: null };
    },
    async findEditable() {
      return { agreement, memberRole: ProjectRole.FREELANCER };
    },
    async updateDraft(input) {
      updatedInput = input;
      return { ...agreement, ...input.changes, contentHash: input.contentHash };
    },
    async submit() {
      return { ...agreement, status: AgreementStatus.PENDING };
    },
    async approve() {
      return { ...agreement, status: AgreementStatus.PENDING, approvalCount: 1 };
    },
    async reject() {
      return { ...agreement, status: AgreementStatus.REJECTED };
    },
  };

  return {
    repository,
    getCreatedInput: () => createdInput,
    getUpdatedInput: () => updatedInput,
  };
}

describe('agreement schema and snapshot', () => {
  test('menormalisasi nominal rupiah dan menghasilkan hash deterministik', () => {
    const normalized = agreementSnapshotSchema.parse({
      ...snapshot,
      amountRupiah: '0003000000',
    });

    expect(normalized.amountRupiah).toBe('3000000');
    expect(hashAgreementSnapshot(normalized)).toBe(hashAgreementSnapshot(snapshot));
  });

  test('menolak nominal nol, tanggal tidak valid, dan deliverable duplikat', () => {
    expect(() =>
      agreementSnapshotSchema.parse({ ...snapshot, amountRupiah: '0' }),
    ).toThrow();
    expect(() =>
      agreementSnapshotSchema.parse({ ...snapshot, deadline: '2026-02-30' }),
    ).toThrow();
    expect(() =>
      agreementSnapshotSchema.parse({
        ...snapshot,
        deliverables: ['Source code', 'Source code'],
      }),
    ).toThrow();
  });
});

describe('agreement service', () => {
  test('create draft menyimpan content hash dari snapshot penuh', async () => {
    const mock = createRepositoryMock();
    const service = createAgreementService(mock.repository);

    await service.createDraft(userId, projectId, snapshot);

    expect(mock.getCreatedInput()).toEqual({
      userId,
      projectId,
      snapshot,
      contentHash: hashAgreementSnapshot(snapshot),
    });
  });

  test('edit draft menghitung ulang hash dari snapshot hasil merge', async () => {
    const mock = createRepositoryMock();
    const service = createAgreementService(mock.repository);

    await service.updateDraft(userId, versionId, { amountRupiah: '3500000' });

    expect(mock.getUpdatedInput()).toMatchObject({
      versionId,
      expectedUpdatedAt: timestamp,
      changes: { amountRupiah: '3500000' },
      contentHash: hashAgreementSnapshot({
        ...snapshot,
        amountRupiah: '3500000',
      }),
    });
  });

  test('klien tidak dapat mengubah draft', async () => {
    const mock = createRepositoryMock();
    mock.repository.findEditable = async () => ({
      agreement,
      memberRole: ProjectRole.CLIENT,
    });
    const service = createAgreementService(mock.repository);

    await expect(
      service.updateDraft(userId, versionId, { revisionLimit: 3 }),
    ).rejects.toMatchObject({ status: 403, code: 'FORBIDDEN' });
  });
});
