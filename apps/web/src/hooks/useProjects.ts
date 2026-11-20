import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from "@open-sunsama/types";
import { getApi } from "@/lib/api";
import { projectKeys, taskKeys } from "@/lib/query-keys";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

import type { ProjectFilter } from "@/lib/project-filter";

export { projectKeys };
export {
  matchesProjectFilter,
  defaultProjectId,
  nextProjectColor,
  type ProjectFilter,
} from "@/lib/project-filter";

/** The user's projects in display order. Archived ones only on request. */
export function useProjects(options?: { includeArchived?: boolean }) {
  const { isAuthenticated } = useAuth();
  const includeArchived = options?.includeArchived ?? false;

  return useQuery({
    queryKey: projectKeys.list(includeArchived),
    queryFn: () => getApi().projects.list({ includeArchived }),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

/**
 * Looks a project up by id, archived ones included, so a task keeps showing
 * its project after the project is archived.
 */
export function useProject(projectId: string | null | undefined): Project | null {
  const { data } = useProjects({ includeArchived: true });
  return React.useMemo(
    () => (projectId ? (data?.find((p) => p.id === projectId) ?? null) : null),
    [data, projectId]
  );
}

function onProjectError(title: string) {
  return (error: unknown) => {
    toast({
      variant: "destructive",
      title,
      description: error instanceof Error ? error.message : "Unknown error",
    });
  };
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => getApi().projects.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
    onError: onProjectError("Failed to create project"),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectInput }) =>
      getApi().projects.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
    onError: onProjectError("Failed to update project"),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getApi().projects.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      // The project's tasks lost their project.
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
    onError: onProjectError("Failed to delete project"),
  });
}

// ---------------------------------------------------------------------------
// Project filter: which project's tasks the board and the backlog show.
// ---------------------------------------------------------------------------

const FILTER_STORAGE_KEY = "open-sunsama-project-filter";
const filterListeners = new Set<() => void>();

function readFilter(): ProjectFilter {
  if (typeof window === "undefined") return "all";
  try {
    return localStorage.getItem(FILTER_STORAGE_KEY) || "all";
  } catch {
    return "all";
  }
}

let currentFilter: ProjectFilter = readFilter();

function setFilter(next: ProjectFilter) {
  currentFilter = next;
  try {
    localStorage.setItem(FILTER_STORAGE_KEY, next);
  } catch {
    // The filter still applies for this session.
  }
  filterListeners.forEach((listener) => listener());
}

function subscribeFilter(listener: () => void) {
  filterListeners.add(listener);
  return () => {
    filterListeners.delete(listener);
  };
}

/**
 * The project filter, shared by every view and remembered on this device.
 * A filter naming a project that no longer exists counts as "all".
 */
export function useProjectFilter(): [ProjectFilter, (next: ProjectFilter) => void] {
  const stored = React.useSyncExternalStore(
    subscribeFilter,
    () => currentFilter,
    () => "all"
  );
  const { data: projects } = useProjects({ includeArchived: true });
  const filter =
    stored === "all" || stored === "none" || !projects
      ? stored
      : projects.some((p) => p.id === stored)
        ? stored
        : "all";
  return [filter, setFilter];
}
