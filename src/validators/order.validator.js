import { z } from "zod";

/**
 * ID parameter validation
 */
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
});

/**
 * Add to cart validation schema
 */
export const addToCartSchema = z.object({
  productId: z.number().int().positive("Product ID is required"),
  variantId: z.number().int().positive().nullable().optional(),
  quantity: z.number().int().positive("Quantity must be positive").default(1),
});

/**
 * Update cart item validation schema
 */
export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive("Quantity must be positive"),
});

/**
 * Create order validation schema
 */
export const createOrderSchema = z.object({
  shippingAddressId: z.number().int().positive("Shipping address is required"),
  billingAddressId: z.number().int().positive().nullable().optional(),
  notes: z.string().max(500).optional(),
  couponCode: z.string().max(50).optional(),
});

/**
 * Update order status validation schema
 */
export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});

/**
 * Create payment validation schema
 */
export const createPaymentSchema = z.object({
  orderId: z.number().int().positive("Order ID is required"),
  paymentMethod: z.enum(["razorpay", "cod"]).default("razorpay"),
});

/**
 * Verify payment validation schema
 */
export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1, "Razorpay order ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay payment ID is required"),
  razorpaySignature: z.string().min(1, "Razorpay signature is required"),
});

/**
 * Order query parameters validation
 */
export const orderQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  status: z
    .enum([
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ])
    .optional(),
  sortBy: z.enum(["createdAt", "total"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
