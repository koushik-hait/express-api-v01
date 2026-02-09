import { z } from "zod";

/**
 * ID parameter validation
 */
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
});

/**
 * Create coupon validation schema
 */
export const createCouponSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase(),
  type: z.enum(["discount", "shipping"]).optional().default("discount"),
  discountType: z
    .enum(["percentage", "fixed"])
    .optional()
    .default("percentage"),
  discountValue: z.number().positive("Discount value is required"),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscountAmount: z.number().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  usageLimit: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

/**
 * Update coupon validation schema
 */
export const updateCouponSchema = createCouponSchema.partial();

/**
 * Validate coupon code schema
 */
export const validateCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  orderTotal: z.number().positive("Order total is required"),
});

/**
 * Create/Update setting validation schema
 */
export const settingSchema = z.object({
  group: z.string().min(1).max(50),
  key: z.string().min(1).max(100),
  value: z.string().optional(),
  type: z.enum(["string", "number", "boolean", "json"]).optional(),
  description: z.string().max(500).optional(),
});

/**
 * Newsletter subscription schema
 */
export const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});
