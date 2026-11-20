/**
 * Validation schemas for project routes
 */

import { z } from 'zod';
import { uuidSchema } from '@open-sunsama/utils';

const nameSchema = z.string().trim().min(1, { error: 'Name is required' }).max(100);
const colorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, { error: 'Color must be a hex value like #6366F1' });

export const createProjectSchema = z.object({
  name: nameSchema,
  color: colorSchema.optional(),
});

export const updateProjectSchema = z.object({
  name: nameSchema.optional(),
  color: colorSchema.optional(),
  archived: z.boolean().optional(),
});

export const projectFilterSchema = z.object({
  includeArchived: z.enum(['true', 'false']).optional(),
});

export const reorderProjectsSchema = z.object({
  projectIds: z.array(uuidSchema).min(1),
});
