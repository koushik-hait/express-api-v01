import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./users.js";
import { products, productVariants } from "./products.js";

// Orders table
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  orderNumber: text("order_number").notNull().unique(),
  subtotal: real("subtotal").notNull(),
  discount: real("discount").default(0),
  tax: real("tax").default(0),
  shippingCost: real("shipping_cost").default(0),
  total: real("total").notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, processing, shipped, delivered, cancelled
  shippingAddressId: integer("shipping_address_id"),
  billingAddressId: integer("billing_address_id"),
  notes: text("notes"),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Order Items table
export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  variantId: integer("variant_id").references(() => productVariants.id),
  productName: text("product_name").notNull(), // Snapshot at order time
  variantName: text("variant_name"),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  totalPrice: real("total_price").notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Payments table
export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  currency: text("currency").default("INR"),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed, refunded
  paymentMethod: text("payment_method"), // razorpay, cod, etc.
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  razorpaySignature: text("razorpay_signature"),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
