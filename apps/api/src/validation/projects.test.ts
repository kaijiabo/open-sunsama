import { describe, expect, it } from "vitest";
import { createProjectSchema, updateProjectSchema } from "./projects";
import {
  createTaskSchema,
  taskFilterSchema,
  updateTaskSchema,
} from "./tasks";

const id = "6f1c2c1e-6d5b-4c0e-9d3a-1f2e3d4c5b6a";

describe("project validation", () => {
  it("trims the name and rejects an empty one", () => {
    expect(createProjectSchema.parse({ name: "  Work " }).name).toBe("Work");
    expect(createProjectSchema.safeParse({ name: "   " }).success).toBe(false);
  });

  it("accepts only six-digit hex colors", () => {
    expect(createProjectSchema.safeParse({ name: "a", color: "#3b82f6" }).success).toBe(true);
    expect(createProjectSchema.safeParse({ name: "a", color: "blue" }).success).toBe(false);
    expect(updateProjectSchema.safeParse({ color: "#FFF" }).success).toBe(false);
  });
});

describe("task project fields", () => {
  it("takes a project id on create and null to clear it on update", () => {
    expect(createTaskSchema.parse({ title: "t", projectId: id }).projectId).toBe(id);
    expect(updateTaskSchema.parse({ projectId: null }).projectId).toBeNull();
    expect(updateTaskSchema.safeParse({ projectId: "nope" }).success).toBe(false);
  });

  it("filters by a project id or by 'none'", () => {
    expect(taskFilterSchema.parse({ projectId: id }).projectId).toBe(id);
    expect(taskFilterSchema.parse({ projectId: "none" }).projectId).toBe("none");
    expect(taskFilterSchema.safeParse({ projectId: "all" }).success).toBe(false);
  });
});
