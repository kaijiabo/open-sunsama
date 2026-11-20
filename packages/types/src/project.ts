/**
 * Project type definitions for Open Sunsama
 * @module @open-sunsama/types/project
 */

/**
 * A project groups tasks (work, a private project, ...).
 * A task belongs to at most one project; a project's unscheduled tasks form
 * its backlog.
 */
export interface Project {
  /** Unique identifier (UUID) */
  id: string;

  /** Owning user */
  userId: string;

  /** Project name */
  name: string;

  /** Hex color, e.g. "#6366F1" */
  color: string;

  /** Order in project lists (lower first) */
  position: number;

  /** Set when the project is archived; archived projects are hidden from pickers */
  archivedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;

  /** Incomplete tasks in the project. Included by the list endpoint. */
  openTaskCount?: number;

  /** Incomplete tasks without a date (the project's backlog). Included by the list endpoint. */
  backlogTaskCount?: number;
}

export interface CreateProjectInput {
  name: string;
  /** Hex color, e.g. "#6366F1" */
  color?: string;
}

export interface UpdateProjectInput {
  name?: string;
  color?: string;
  /** true archives the project, false restores it */
  archived?: boolean;
}

/** Colors offered when creating or editing a project. */
export const PROJECT_COLORS = [
  "#6366F1",
  "#3B82F6",
  "#06B6D4",
  "#10B981",
  "#84CC16",
  "#EAB308",
  "#F97316",
  "#EF4444",
  "#EC4899",
  "#A855F7",
  "#64748B",
] as const;
