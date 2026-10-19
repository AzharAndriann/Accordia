import { describe, expect, test } from 'bun:test';
import { ProjectRole, ProjectStatus } from '../../generated/prisma/enums';
import type { ProjectRepository } from './project.repository';
import { createProjectSchema, listProjectsQuerySchema } from './project.schema';
import { createProjectService } from './project.service';
import type { ProjectSummary } from './project.types';

const createdAt = new Date('2026-10-19T00:00:00.000Z');
const project: ProjectSummary = {
  id: '6b79fc7b-2a72-49eb-99f6-184267581142',
  title: 'Website profil perusahaan',
  description: 'Website responsif untuk perusahaan.',
  creatorId: 'e48908f0-69f3-4da4-b9bd-3df4ac033f50',
  status: ProjectStatus.DRAFT,
  role: ProjectRole.FREELANCER,
  activeAgreementVersionId: null,
  createdAt,
  updatedAt: createdAt,
};

function createRepositoryMock() {
  const calls: Array<{ userId: string; input: unknown }> = [];
  const repository: ProjectRepository = {
    async createWithOwner(userId, input) {
      calls.push({ userId, input });
      return project;
    },
    async listForUser() {
      return { data: [project], nextCursor: null };
    },
  };

  return { calls, repository };
}

describe('project schema', () => {
  test('membersihkan input dan memberi default pagination', () => {
    const input = createProjectSchema.parse({
      title: '  Website profil perusahaan  ',
      description: '  Website responsif untuk perusahaan.  ',
    });
    const pagination = listProjectsQuerySchema.parse({});

    expect(input).toEqual({
      title: 'Website profil perusahaan',
      description: 'Website responsif untuk perusahaan.',
    });
    expect(pagination).toEqual({ limit: 20 });
  });

  test('menolak limit lebih dari 100 dan cursor non-UUID', () => {
    expect(() => listProjectsQuerySchema.parse({ limit: 101 })).toThrow();
    expect(() => listProjectsQuerySchema.parse({ cursor: 'bukan-uuid' })).toThrow();
  });
});

describe('project service', () => {
  test('membuat proyek untuk pengguna yang sedang login', async () => {
    const mock = createRepositoryMock();
    const service = createProjectService(mock.repository);

    const result = await service.create(project.creatorId, {
      title: project.title,
      description: project.description,
    });

    expect(mock.calls).toEqual([
      {
        userId: project.creatorId,
        input: { title: project.title, description: project.description },
      },
    ]);
    expect(result.role).toBe(ProjectRole.FREELANCER);
    expect(result.status).toBe(ProjectStatus.DRAFT);
  });

  test('daftar proyek hanya diteruskan untuk user dan pagination terkait', async () => {
    const mock = createRepositoryMock();
    const service = createProjectService(mock.repository);
    const result = await service.list(project.creatorId, { limit: 20 });

    expect(result).toEqual({ data: [project], nextCursor: null });
  });
});
