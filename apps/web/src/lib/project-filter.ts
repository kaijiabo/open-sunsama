import type { Project, Task } from "@open-sunsama/types";
import { PROJECT_COLORS } from "@open-sunsama/types";

/** "all", "none" (tasks without a project), or a project id. */
export type ProjectFilter = string;

export function matchesProjectFilter(
  task: Pick<Task, "projectId">,
  filter: ProjectFilter
): boolean {
  if (filter === "all") return true;
  if (filter === "none") return !task.projectId;
  return task.projectId === filter;
}

/** The project a new task gets by default: the one being filtered to. */
export function defaultProjectId(filter: ProjectFilter): string | null {
  return filter === "all" || filter === "none" ? null : filter;
}

/** The first palette color no other project uses yet. */
export function nextProjectColor(
  projects: Pick<Project, "color">[] | undefined
): string {
  const used = new Set((projects ?? []).map((p) => p.color.toUpperCase()));
  return (
    PROJECT_COLORS.find((c) => !used.has(c)) ??
    PROJECT_COLORS[(projects?.length ?? 0) % PROJECT_COLORS.length]!
  );
}
