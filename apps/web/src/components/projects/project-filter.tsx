import * as React from "react";
import { Check, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useProject, useProjectFilter } from "@/hooks/useProjects";
import { ProjectDot, ProjectMenu } from "./project-menu";

/**
 * Chooses which project's tasks the board and the backlog show. The choice
 * is shared between them, so a project's planned days and its backlog are
 * always looked at together.
 */
export function ProjectFilterButton({
  className,
  align = "end",
}: {
  className?: string;
  align?: "start" | "end";
}) {
  const [filter, setFilter] = useProjectFilter();
  const [open, setOpen] = React.useState(false);
  const project = useProject(
    filter === "all" || filter === "none" ? null : filter
  );
  const label =
    filter === "all" ? "All projects" : filter === "none" ? "No project" : (project?.name ?? "Project");

  const pick = (next: string) => {
    setFilter(next);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Project filter: ${label}`}
          title={`Project filter: ${label}`}
          className={cn(
            "flex h-7 max-w-40 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs transition-colors hover:bg-accent focus:outline-hidden focus-visible:ring-1 focus-visible:ring-ring data-[state=open]:bg-accent",
            filter === "all" ? "text-muted-foreground hover:text-foreground" : "bg-muted/60 text-foreground",
            className
          )}
        >
          {filter === "all" ? (
            <Layers className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <ProjectDot color={project?.color} />
          )}
          <span className="truncate">{filter === "all" ? "Projects" : label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <ProjectMenu
          value={filter === "all" || filter === "none" ? null : filter}
          onChange={(id) => pick(id ?? "none")}
          noneLabel="No project"
          noneSelected={filter === "none"}
          allowCreate={false}
          extraRows={
            <button
              type="button"
              role="option"
              aria-selected={filter === "all"}
              onClick={() => pick("all")}
              className={cn(
                "flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent focus:bg-accent focus:outline-hidden",
                filter === "all" && "bg-accent"
              )}
            >
              <Layers className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="flex-1">All projects</span>
              {filter === "all" && <Check className="h-3.5 w-3.5" />}
            </button>
          }
        />
      </PopoverContent>
    </Popover>
  );
}
