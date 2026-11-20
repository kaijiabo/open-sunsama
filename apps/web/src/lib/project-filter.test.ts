import { describe, expect, it } from "vitest";
import { PROJECT_COLORS } from "@open-sunsama/types";
import {
  defaultProjectId,
  matchesProjectFilter,
  nextProjectColor,
} from "./project-filter";

describe("matchesProjectFilter", () => {
  const inWork = { projectId: "work" };
  const noProject = { projectId: null };

  it("shows every task for 'all'", () => {
    expect(matchesProjectFilter(inWork, "all")).toBe(true);
    expect(matchesProjectFilter(noProject, "all")).toBe(true);
  });

  it("shows only tasks without a project for 'none'", () => {
    expect(matchesProjectFilter(inWork, "none")).toBe(false);
    expect(matchesProjectFilter(noProject, "none")).toBe(true);
  });

  it("shows only the chosen project's tasks", () => {
    expect(matchesProjectFilter(inWork, "work")).toBe(true);
    expect(matchesProjectFilter(inWork, "house")).toBe(false);
    expect(matchesProjectFilter(noProject, "work")).toBe(false);
  });
});

describe("defaultProjectId", () => {
  it("files new tasks under the project being filtered to", () => {
    expect(defaultProjectId("work")).toBe("work");
  });

  it("leaves new tasks without a project otherwise", () => {
    expect(defaultProjectId("all")).toBeNull();
    expect(defaultProjectId("none")).toBeNull();
  });
});

describe("nextProjectColor", () => {
  it("starts with the first palette color", () => {
    expect(nextProjectColor([])).toBe(PROJECT_COLORS[0]);
    expect(nextProjectColor(undefined)).toBe(PROJECT_COLORS[0]);
  });

  it("skips colors already in use, whatever their case", () => {
    expect(
      nextProjectColor([{ color: PROJECT_COLORS[0].toLowerCase() }])
    ).toBe(PROJECT_COLORS[1]);
  });

  it("cycles once every color is taken", () => {
    const all = PROJECT_COLORS.map((color) => ({ color }));
    expect(PROJECT_COLORS).toContain(nextProjectColor(all));
  });
});
