import * as React from "react";
import { Check, Plus } from "lucide-react";
import type { Project } from "@open-sunsama/types";
import { cn } from "@/lib/utils";
import {
  useProjects,
  useCreateProject,
  nextProjectColor,
} from "@/hooks/useProjects";

/** The colored dot that stands for a project. */
export function ProjectDot({
  color,
  className,
}: {
  color: string | null | undefined;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-2 w-2 shrink-0 rounded-full",
        !color && "border border-muted-foreground/50",
        className
      )}
      style={color ? { backgroundColor: color } : undefined}
    />
  );
}

const row =
  "flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent focus:bg-accent focus:outline-hidden";

/**
 * The project list shown in a popover: "No project", each active project,
 * and a field to create one on the spot. Shared by cards, the task modal,
 * the add-task composer and the filters.
 */
export function ProjectMenu({
  value,
  onChange,
  noneLabel = "No project",
  noneSelected,
  extraRows,
  allowCreate = true,
}: {
  /** The selected project id; null = no project. */
  value: string | null;
  onChange: (projectId: string | null) => void;
  noneLabel?: string;
  /** Whether the "no project" row is the selected one. Defaults to value === null. */
  noneSelected?: boolean;
  /** Rows above the list (the filter's "All projects"). */
  extraRows?: React.ReactNode;
  allowCreate?: boolean;
}) {
  const { data: allProjects } = useProjects({ includeArchived: true });
  const createProject = useCreateProject();
  const [name, setName] = React.useState("");

  // Archived projects are hidden, except the one already selected.
  const projects = (allProjects ?? []).filter(
    (p: Project) => !p.archivedAt || p.id === value
  );

  const isNone = noneSelected ?? value === null;

  const create = async () => {
    const trimmed = name.trim();
    if (!trimmed || createProject.isPending) return;
    const project = await createProject.mutateAsync({
      name: trimmed,
      color: nextProjectColor(allProjects),
    });
    setName("");
    onChange(project.id);
  };

  return (
    <div
      role="listbox"
      aria-label="Project"
      className="w-56 p-1"
      onClick={(e) => e.stopPropagation()}
    >
      <p className="px-2 pb-1 pt-1.5 text-xs text-muted-foreground">Project</p>
      {extraRows}
      <button
        type="button"
        role="option"
        aria-selected={isNone}
        onClick={() => onChange(null)}
        className={cn(row, isNone && "bg-accent")}
      >
        <ProjectDot color={null} />
        <span className="flex-1 text-muted-foreground">{noneLabel}</span>
        {isNone && <Check className="h-3.5 w-3.5" />}
      </button>
      <div className="max-h-64 overflow-y-auto">
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            role="option"
            aria-selected={value === project.id}
            onClick={() => onChange(project.id)}
            className={cn(row, value === project.id && "bg-accent")}
          >
            <ProjectDot color={project.color} />
            <span className="min-w-0 flex-1 truncate">{project.name}</span>
            {value === project.id && <Check className="h-3.5 w-3.5 shrink-0" />}
          </button>
        ))}
      </div>
      {allowCreate && (
        <div className="mt-1 flex items-center gap-2 border-t border-border/60 px-2 pt-1.5 pb-1">
          <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              // Keep task shortcuts (priority keys, Enter) out of the field.
              e.stopPropagation();
              if (e.key === "Enter") {
                e.preventDefault();
                void create();
              }
            }}
            placeholder="New project…"
            aria-label="New project name"
            maxLength={100}
            className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-hidden placeholder:text-muted-foreground/60"
          />
        </div>
      )}
    </div>
  );
}
