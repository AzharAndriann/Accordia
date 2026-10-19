import type { CreateProjectInput, ListProjectsQuery } from './project.schema';
import type { ProjectRepository } from './project.repository';

export function createProjectService(repository: ProjectRepository) {
  return {
    create(userId: string, input: CreateProjectInput) {
      return repository.createWithOwner(userId, input);
    },

    list(userId: string, query: ListProjectsQuery) {
      return repository.listForUser(userId, query);
    },
  };
}

export type ProjectService = ReturnType<typeof createProjectService>;
