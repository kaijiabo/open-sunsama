/**
 * Projects API methods
 * @module @open-sunsama/api-client/projects
 */

import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from "@open-sunsama/types";
import type { OpenSunsamaClient, RequestOptions } from "./client.js";

interface ApiResponseWrapper<T> {
  success: boolean;
  data: T;
}

export interface ProjectsApi {
  /** List projects in display order, with open task counts */
  list(
    filters?: { includeArchived?: boolean },
    options?: RequestOptions
  ): Promise<Project[]>;
  create(input: CreateProjectInput, options?: RequestOptions): Promise<Project>;
  update(
    id: string,
    input: UpdateProjectInput,
    options?: RequestOptions
  ): Promise<Project>;
  /** Delete a project. Its tasks stay, without a project. */
  delete(id: string, options?: RequestOptions): Promise<void>;
  reorder(projectIds: string[], options?: RequestOptions): Promise<void>;
}

export function createProjectsApi(client: OpenSunsamaClient): ProjectsApi {
  return {
    async list(filters, options) {
      const response = await client.get<ApiResponseWrapper<Project[]>>(
        "projects",
        {
          ...options,
          searchParams: {
            ...options?.searchParams,
            includeArchived: filters?.includeArchived ? "true" : undefined,
          },
        }
      );
      return response.data;
    },

    async create(input, options) {
      const response = await client.post<ApiResponseWrapper<Project>>(
        "projects",
        input,
        options
      );
      return response.data;
    },

    async update(id, input, options) {
      const response = await client.patch<ApiResponseWrapper<Project>>(
        `projects/${id}`,
        input,
        options
      );
      return response.data;
    },

    async delete(id, options) {
      await client.delete<ApiResponseWrapper<void>>(`projects/${id}`, options);
    },

    async reorder(projectIds, options) {
      await client.post<ApiResponseWrapper<void>>(
        "projects/reorder",
        { projectIds },
        options
      );
    },
  };
}
