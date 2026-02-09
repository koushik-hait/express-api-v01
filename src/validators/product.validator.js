import { z } from "zod";

/**
 * ID parameter validation
 */
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
});

/**
 * Create category validation schema
 */
export const createCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  parentId: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

/**
 * Update category validation schema
 */
export const updateCategorySchema = createCategorySchema.partial();

/**
 * Create product validation schema
 */
export const createProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  slug: z.string().min(2).max(200).optional(),
  shortDescription: z.string().max(500).optional(),
  longDescription: z.string().optional(),
  mrp: z.number().positive("MRP must be positive"),
  sellingPrice: z.number().positive("Selling price must be positive"),
  discountPercentage: z.number().min(0).max(100).optional(),
  stock: z.number().int().min(0).optional(),
  sku: z.string().max(50).optional(),
  categoryId: z.number().int().positive("Category ID is required"),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

/**
 * Update product validation schema
 */
export const updateProductSchema = createProductSchema.partial();

/**
 * Create product variant validation schema
 */
export const createVariantSchema = z.object({
  productId: z.number().int().positive("Product ID is required"),
  key: z.string().min(1, "Key is required").max(50),
  value: z.string().min(1, "Value is required").max(100),
  priceModifier: z.number().optional(),
  stockModifier: z.number().int().optional(),
  sku: z.string().max(50).optional(),
});

/**
 * Update product variant validation schema
 */
export const updateVariantSchema = createVariantSchema
  .partial()
  .omit({ productId: true });

/**
 * Create tag validation schema
 */
export const createTagSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  slug: z.string().min(2).max(50).optional(),
});

/**
 * Update tag validation schema
 */
export const updateTagSchema = createTagSchema.partial();

/**
 * Product query parameters validation
 */
export const productQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  isFeatured: z.enum(["true", "false"]).optional(),
  isActive: z.enum(["true", "false"]).optional(),
  sortBy: z.enum(["name", "sellingPrice", "createdAt", "stock"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

/**
 * Category query parameters validation
 */
export const categoryQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  search: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
});
