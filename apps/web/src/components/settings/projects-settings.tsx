import * as React from "react";
import {
  Archive,
  ArchiveRestore,
  ArrowDown,
  ArrowUp,
  Folder,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Project } from "@open-sunsama/types";
import { PROJECT_COLORS } from "@open-sunsama/types";
import {
  Button,
  Input,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getApi } from "@/lib/api";
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  nextProjectColor,
  projectKeys,
} from "@/hooks/useProjects";

/** Create, rename, recolor, reorder, archive and delete projects. */
export function ProjectsSettings() {
  const queryClient = useQueryClient();
  const { data: projects = [], isLoading } = useProjects({ includeArchived: true });
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const [name, setName] = React.useState("");
  const [color, setColor] = React.useState<string | null>(null);
  const [toDelete, setToDelete] = React.useState<Project | null>(null);

  const active = projects.filter((p) => !p.archivedAt);
  const archived = projects.filter((p) => p.archivedAt);
  const newColor = color ?? nextProjectColor(projects);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || createProject.isPending) return;
    await createProject.mutateAsync({ name: trimmed, color: newColor });
    setName("");
    setColor(null);
  };

  const move = async (index: number, delta: number) => {
    const next = [...active];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    // Show the new order at once; the refetch confirms it.
    queryClient.setQueryData<Project[]>(projectKeys.list(true), [
      ...next,
      ...archived,
    ]);
    try {
      await getApi().projects.reorder(next.map((p) => p.id));
    } finally {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Projects</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Group tasks by project, for example work and each private project. A
          task belongs to one project; its unscheduled tasks are the
          project's backlog.
        </p>
      </div>

      <form onSubmit={create} className="flex items-center gap-2">
        <ColorPicker value={newColor} onChange={setColor} />
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project name"
          maxLength={100}
          className="flex-1"
        />
        <Button type="submit" disabled={!name.trim() || createProject.isPending}>
          Add project
        </Button>
      </form>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-lg border border-dashed py-8 text-center">
          <Folder className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No projects yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {active.map((project, index) => (
            <ProjectRow
              key={project.id}
              project={project}
              onMoveUp={index > 0 ? () => move(index, -1) : undefined}
              onMoveDown={
                index < active.length - 1 ? () => move(index, 1) : undefined
              }
              onDelete={() => setToDelete(project)}
            />
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Archived
          </h3>
          {archived.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              onDelete={() => setToDelete(project)}
            />
          ))}
        </div>
      )}

      <Dialog open={toDelete !== null} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project?</DialogTitle>
            <DialogDescription>
              {`"${toDelete?.name}" will be deleted. Its tasks are kept and end up without a project. To keep them grouped, archive the project instead.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (toDelete) deleteProject.mutate(toDelete.id);
                setToDelete(null);
              }}
            >
              Delete project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Project color"
          title="Project color"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent focus:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
        >
          <span
            className="h-3.5 w-3.5 rounded-full"
            style={{ backgroundColor: value }}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-2">
        <div className="grid grid-cols-6 gap-1.5">
          {PROJECT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color ${c}`}
              onClick={() => {
                onChange(c);
                setOpen(false);
              }}
              className={cn(
                "h-6 w-6 rounded-full ring-offset-2 ring-offset-popover transition-shadow focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
                c === value.toUpperCase() && "ring-2 ring-foreground/60"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ProjectRow({
  project,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  project: Project;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete: () => void;
}) {
  const updateProject = useUpdateProject();
  const [name, setName] = React.useState(project.name);
  React.useEffect(() => setName(project.name), [project.name]);
  const isArchived = !!project.archivedAt;

  const rename = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setName(project.name);
    } else if (trimmed !== project.name) {
      updateProject.mutate({ id: project.id, input: { name: trimmed } });
    }
  };

  const open = project.openTaskCount ?? 0;
  const backlog = project.backlogTaskCount ?? 0;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-card p-2 pl-1.5",
        isArchived && "opacity-60"
      )}
    >
      <ColorPicker
        value={project.color}
        onChange={(color) =>
          updateProject.mutate({ id: project.id, input: { color } })
        }
      />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={rename}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setName(project.name);
            e.currentTarget.blur();
          }
        }}
        aria-label="Project name"
        maxLength={100}
        className="min-w-0 flex-1 rounded bg-transparent px-1 py-1 text-sm font-medium outline-hidden focus:bg-muted/50"
      />
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {open === 0
          ? "No open tasks"
          : `${open} open · ${backlog} in backlog`}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            aria-label={`Actions for ${project.name}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {onMoveUp && (
            <DropdownMenuItem onSelect={onMoveUp}>
              <ArrowUp className="mr-2 h-4 w-4" />
              Move up
            </DropdownMenuItem>
          )}
          {onMoveDown && (
            <DropdownMenuItem onSelect={onMoveDown}>
              <ArrowDown className="mr-2 h-4 w-4" />
              Move down
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onSelect={() =>
              updateProject.mutate({
                id: project.id,
                input: { archived: !isArchived },
              })
            }
          >
            {isArchived ? (
              <ArchiveRestore className="mr-2 h-4 w-4" />
            ) : (
              <Archive className="mr-2 h-4 w-4" />
            )}
            {isArchived ? "Restore" : "Archive"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
