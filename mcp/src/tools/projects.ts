/**
 * MCP Tools for Projects
 * A project groups tasks; a task belongs to at most one project.
 */

import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import type { ApiClient, Project } from "../lib/api-client.js";
import { defineTool } from "../lib/define-tool.js";

function formatProject(project: Project): string {
  const lines = [
    `ID: ${project.id}`,
    `Name: ${project.name}`,
    `Color: ${project.color}`,
    `Status: ${project.archivedAt ? "Archived" : "Active"}`,
  ];
  if (project.openTaskCount !== undefined) {
    lines.push(
      `Open tasks: ${project.openTaskCount} (${project.backlogTaskCount ?? 0} in the backlog)`
    );
  }
  return lines.join("\n");
}

function successResponse(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

function errorResponse(message: string) {
  return {
    content: [{ type: "text" as const, text: `Error: ${message}` }],
    isError: true,
  };
}

const colorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .describe("Hex color, e.g. '#6366F1'.");

export function registerProjectTools(
  server: McpServer,
  apiClient: ApiClient
): void {
  defineTool(server,
    "list_projects",
    `List the user's projects in display order, with how many open tasks each has and how many of those are unscheduled (the project's backlog).

Use a project's ID as "projectId" in list_tasks, create_task and update_task.

Examples:
- Active projects: {}
- Including archived ones: { "includeArchived": true }`,
    {
      includeArchived: z
        .boolean()
        .optional()
        .describe("Also return archived projects. Default: false."),
    },
    async (input) => {
      try {
        const response = await apiClient.listProjects({
          includeArchived: input.includeArchived,
        });
        if (!response.success || !response.data) {
          return errorResponse(
            response.error?.message ?? "Failed to list projects"
          );
        }
        if (response.data.length === 0) {
          return successResponse("No projects found.");
        }
        return successResponse(
          response.data.map(formatProject).join("\n\n")
        );
      } catch (error) {
        return errorResponse(
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }
  );

  defineTool(server,
    "create_project",
    `Create a project to group tasks.

Example: { "name": "Work", "color": "#3B82F6" }`,
    {
      name: z.string().min(1).max(100).describe("Project name (1-100 characters)."),
      color: colorSchema.optional(),
    },
    async (input) => {
      try {
        const response = await apiClient.createProject({
          name: input.name,
          color: input.color,
        });
        if (!response.success || !response.data) {
          return errorResponse(
            response.error?.message ?? "Failed to create project"
          );
        }
        return successResponse(
          `Project created successfully!\n\n${formatProject(response.data)}`
        );
      } catch (error) {
        return errorResponse(
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }
  );

  defineTool(server,
    "update_project",
    `Rename, recolor, archive or restore a project. Only provide fields you want to change.

Archiving hides a project from pickers; its tasks keep the project.

Examples:
- Rename: { "id": "<project id>", "name": "Client work" }
- Archive: { "id": "<project id>", "archived": true }`,
    {
      id: z.string().describe("The project ID to update."),
      name: z.string().min(1).max(100).optional().describe("New name."),
      color: colorSchema.optional(),
      archived: z
        .boolean()
        .optional()
        .describe("true archives the project, false restores it."),
    },
    async (input) => {
      try {
        const { id, ...updates } = input;
        if (Object.values(updates).every((v) => v === undefined)) {
          return errorResponse(
            "No fields to update. Provide at least one field to change."
          );
        }
        const response = await apiClient.updateProject(id, updates);
        if (!response.success || !response.data) {
          return errorResponse(
            response.error?.message ?? "Failed to update project"
          );
        }
        return successResponse(
          `Project updated successfully!\n\n${formatProject(response.data)}`
        );
      } catch (error) {
        return errorResponse(
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }
  );

  defineTool(server,
    "delete_project",
    `Permanently delete a project. Its tasks are kept and end up without a project. To keep the grouping but hide the project, archive it with update_project instead.

Example: { "id": "<project id>" }`,
    {
      id: z.string().describe("The project ID to delete."),
    },
    async (input) => {
      try {
        const response = await apiClient.deleteProject(input.id);
        if (!response.success) {
          return errorResponse(
            response.error?.message ?? "Failed to delete project"
          );
        }
        return successResponse(`Project ${input.id} deleted successfully.`);
      } catch (error) {
        return errorResponse(
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }
  );
}
