import { z } from "zod";

/**
 * ID parameter validation
 */
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
});

/**
 * Add to wishlist validation schema
 */
export const addToWishlistSchema = z.object({
  productId: z.number().int().positive("Product ID is required"),
});

/**
 * Create review validation schema
 */
export const createReviewSchema = z.object({
  productId: z.number().int().positive("Product ID is required"),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  title: z.string().max(100).optional(),
  comment: z.string().max(1000).optional(),
});

/**
 * Update review validation schema
 */
export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(100).optional(),
  comment: z.string().max(1000).optional(),
});

/**
 * Create address validation schema
 */
export const createAddressSchema = z.object({
  label: z.string().max(50).optional(),
  fullName: z.string().min(2).max(100),
  phone: z.string().min(10).max(15),
  landmark: z.string().max(100).optional(),
  addressLine1: z.string().min(5).max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  zip: z.string().min(4).max(10),
  country: z.string().max(100).optional().default("India"),
  isDefault: z.boolean().optional(),
});

/**
 * Update address validation schema
 */
export const updateAddressSchema = createAddressSchema.partial();

/**
 * Create notification validation schema
 */
export const createNotificationSchema = z.object({
  userId: z.number().int().positive(),
  type: z.enum(["info", "success", "warning", "error"]).optional(),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  data: z.string().optional(),
});
