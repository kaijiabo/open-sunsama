/**
 * Project routes for Open Sunsama API
 * A project groups tasks; a task belongs to at most one project.
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  getDb,
  eq,
  and,
  asc,
  isNull,
  sql,
  projects,
  tasks,
} from "@open-sunsama/database";
import { NotFoundError, uuidSchema } from "@open-sunsama/utils";
import { auth, requireScopes, type AuthVariables } from "../middleware/auth.js";
import {
  createProjectSchema,
  updateProjectSchema,
  projectFilterSchema,
  reorderProjectsSchema,
} from "../validation/projects.js";
import { publishEvent } from "../lib/websocket/index.js";

const projectsRouter = new Hono<{ Variables: AuthVariables }>();
projectsRouter.use("*", auth);

/** GET /projects - List projects with their open task counts */
projectsRouter.get(
  "/",
  requireScopes("tasks:read"),
  zValidator("query", projectFilterSchema),
  async (c) => {
    const userId = c.get("userId");
    const { includeArchived } = c.req.valid("query");
    const db = getDb();

    const conditions = [eq(projects.userId, userId)];
    if (includeArchived !== "true") conditions.push(isNull(projects.archivedAt));

    const rows = await db
      .select()
      .from(projects)
      .where(and(...conditions))
      .orderBy(asc(projects.position), asc(projects.createdAt));

    // Open (incomplete) tasks per project: all of them, and those without a
    // date, which make up the project's backlog.
    const counts = await db
      .select({
        projectId: tasks.projectId,
        open: sql<number>`count(*)::int`,
        backlog: sql<number>`count(*) FILTER (WHERE ${tasks.scheduledDate} IS NULL)::int`,
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          isNull(tasks.completedAt),
          sql`${tasks.projectId} IS NOT NULL`
        )
      )
      .groupBy(tasks.projectId);
    const byProject = new Map(counts.map((r) => [r.projectId, r]));

    return c.json({
      success: true,
      data: rows.map((p) => ({
        ...p,
        openTaskCount: byProject.get(p.id)?.open ?? 0,
        backlogTaskCount: byProject.get(p.id)?.backlog ?? 0,
      })),
    });
  }
);

/** POST /projects - Create a project */
projectsRouter.post(
  "/",
  requireScopes("tasks:write"),
  zValidator("json", createProjectSchema),
  async (c) => {
    const userId = c.get("userId");
    const data = c.req.valid("json");
    const db = getDb();

    const [maxPos] = await db
      .select({ max: sql<number>`COALESCE(MAX(${projects.position}), -1)` })
      .from(projects)
      .where(eq(projects.userId, userId));

    const [project] = await db
      .insert(projects)
      .values({
        userId,
        name: data.name,
        ...(data.color ? { color: data.color.toUpperCase() } : {}),
        position: (maxPos?.max ?? -1) + 1,
      })
      .returning();

    if (project) publishEvent(userId, "project:created", { projectId: project.id });
    return c.json(
      { success: true, data: { ...project, openTaskCount: 0, backlogTaskCount: 0 } },
      201
    );
  }
);

/**
 * POST /projects/reorder - Set the order of the project list.
 * Registered before "/:id" so the static path matches first.
 */
projectsRouter.post(
  "/reorder",
  requireScopes("tasks:write"),
  zValidator("json", reorderProjectsSchema),
  async (c) => {
    const userId = c.get("userId");
    const { projectIds } = c.req.valid("json");
    const db = getDb();

    await Promise.all(
      projectIds.map((id, index) =>
        db
          .update(projects)
          .set({ position: index, updatedAt: new Date() })
          .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      )
    );

    publishEvent(userId, "project:updated", { projectIds });
    return c.json({ success: true, message: "Projects reordered" });
  }
);

/** PATCH /projects/:id - Rename, recolor, archive or restore a project */
projectsRouter.patch(
  "/:id",
  requireScopes("tasks:write"),
  zValidator("param", z.object({ id: uuidSchema })),
  zValidator("json", updateProjectSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const updates = c.req.valid("json");
    const db = getDb();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.color !== undefined) updateData.color = updates.color.toUpperCase();
    if (updates.archived !== undefined)
      updateData.archivedAt = updates.archived ? new Date() : null;

    const [project] = await db
      .update(projects)
      .set(updateData)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning();
    if (!project) throw new NotFoundError("Project", id);

    publishEvent(userId, "project:updated", { projectId: id });
    return c.json({ success: true, data: project });
  }
);

/** DELETE /projects/:id - Delete a project; its tasks stay, without a project */
projectsRouter.delete(
  "/:id",
  requireScopes("tasks:write"),
  zValidator("param", z.object({ id: uuidSchema })),
  async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const db = getDb();

    const [deleted] = await db
      .delete(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning({ id: projects.id });
    if (!deleted) throw new NotFoundError("Project", id);

    publishEvent(userId, "project:deleted", { projectId: id });
    return c.json({ success: true, message: "Project deleted successfully" });
  }
);

export { projectsRouter };
