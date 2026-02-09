import { z } from "zod";

/**
 * Create user validation schema
 */
export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password cannot exceed 100 characters"),
  phone: z.string().optional(),
  roleId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

/**
 * Update user validation schema
 */
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  roleId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

/**
 * ID parameter validation
 */
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
});

/**
 * Query parameters validation
 */
export const userQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  search: z.string().optional(),
  roleId: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
  sortBy: z.enum(["name", "email", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
