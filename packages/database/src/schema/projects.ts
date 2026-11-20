/**
 * Projects schema
 * A project groups tasks (work, a private project, ...). A task belongs to at
 * most one project. Unscheduled tasks of a project form its backlog.
 */
import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    /** Hex color, e.g. "#6366F1" */
    color: varchar("color", { length: 7 }).notNull().default("#6366F1"),
    /** Order in project lists (lower first) */
    position: integer("position").notNull().default(0),
    /** Archived projects keep their tasks but are hidden from pickers. */
    archivedAt: timestamp("archived_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("projects_user_position_idx").on(table.userId, table.position)]
);

export const projectsRelations = relations(projects, ({ one }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
}));

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
