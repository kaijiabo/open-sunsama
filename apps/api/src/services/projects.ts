/**
 * Project helpers shared by the routes that accept a projectId.
 */
import { getDb, eq, and, projects } from "@open-sunsama/database";
import { ValidationError } from "@open-sunsama/utils";

/**
 * Rejects a projectId that isn't one of the user's own projects, so a task or
 * series can never point at someone else's project.
 */
export async function assertProjectOwned(
  userId: string,
  projectId: string | null | undefined
): Promise<void> {
  if (!projectId) return;
  const [project] = await getDb()
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);
  if (!project) {
    throw new ValidationError("Project not found", {
      projectId: ["Project not found"],
    });
  }
}
