import { eq, and, desc, asc, count } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import db from "../db/index.js";
import {
  orders,
  orderItems,
  cart,
  cartItems,
  products,
  productVariants,
  addresses,
  coupons,
} from "../db/schema/index.js";
import { asyncHandler, NotFoundError, AppError } from "../utils/errors.js";
import { sendSuccess, sendCreated, sendPaginated } from "../utils/response.js";
import {
  getPaginationParams,
  buildPaginationMeta,
  getSortParams,
} from "../utils/pagination.js";

/**
 * Generate unique order number
 */
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = uuidv4().split("-")[0].toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

/**
 * @desc    Get user's orders
 * @route   GET /api/v1/orders
 * @access  Private
 */
export const getOrders = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPaginationParams(req.query);
  const { sortField, sortOrder } = getSortParams(
    req.query,
    ["createdAt", "total"],
    "createdAt",
    "desc",
  );
  const { status } = req.query;

  // Build where conditions
  const conditions = [eq(orders.userId, req.user.id)];
  if (status) {
    conditions.push(eq(orders.status, status));
  }

  const whereClause = and(...conditions);

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(orders)
    .where(whereClause);

  // Get orders
  const orderBy =
    sortOrder === "asc" ? asc(orders[sortField]) : desc(orders[sortField]);

  const orderList = await db
    .select()
    .from(orders)
    .where(whereClause)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  const pagination = buildPaginationMeta(total, page, limit);

  sendPaginated(res, orderList, pagination, "Orders fetched successfully");
});

/**
 * @desc    Get single order with items
 * @route   GET /api/v1/orders/:id
 * @access  Private
 */
export const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.userId, req.user.id)))
    .limit(1);

  if (!order) {
    throw new NotFoundError("Order");
  }

  // Get order items
  const items = await db
    .select({
      id: orderItems.id,
      productId: orderItems.productId,
      variantId: orderItems.variantId,
      productName: orderItems.productName,
      variantName: orderItems.variantName,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      totalPrice: orderItems.totalPrice,
      productImage: products.featuredImage,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, id));

  // Get addresses
  let shippingAddress = null;
  let billingAddress = null;

  if (order.shippingAddressId) {
    [shippingAddress] = await db
      .select()
      .from(addresses)
      .where(eq(addresses.id, order.shippingAddressId))
      .limit(1);
  }

  if (order.billingAddressId) {
    [billingAddress] = await db
      .select()
      .from(addresses)
      .where(eq(addresses.id, order.billingAddressId))
      .limit(1);
  }

  sendSuccess(
    res,
    {
      ...order,
      items,
      shippingAddress,
      billingAddress,
    },
    "Order fetched successfully",
  );
});

/**
 * @desc    Create order from cart
 * @route   POST /api/v1/orders
 * @access  Private
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddressId, billingAddressId, notes, couponCode } = req.body;

  // Verify shipping address
  const [shippingAddress] = await db
    .select()
    .from(addresses)
    .where(
      and(
        eq(addresses.id, shippingAddressId),
        eq(addresses.userId, req.user.id),
      ),
    )
    .limit(1);

  if (!shippingAddress) {
    throw new NotFoundError("Shipping address");
  }

  // Get user's cart
  const [userCart] = await db
    .select()
    .from(cart)
    .where(eq(cart.userId, req.user.id))
    .limit(1);

  if (!userCart) {
    throw new AppError("Cart is empty", 400);
  }

  // Get cart items
  const items = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      variantId: cartItems.variantId,
      quantity: cartItems.quantity,
      productName: products.name,
      sellingPrice: products.sellingPrice,
      stock: products.stock,
      variantKey: productVariants.key,
      variantValue: productVariants.value,
      priceModifier: productVariants.priceModifier,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .leftJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .where(eq(cartItems.cartId, userCart.id));

  if (items.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  // Validate stock and calculate subtotal
  let subtotal = 0;
  const orderItemsData = [];

  for (const item of items) {
    if (item.stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${item.productName}`, 400);
    }

    const unitPrice = item.sellingPrice + (item.priceModifier || 0);
    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;

    orderItemsData.push({
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      variantName: item.variantId
        ? `${item.variantKey}: ${item.variantValue}`
        : null,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
    });
  }

  // Apply coupon if provided
  let discount = 0;
  if (couponCode) {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, couponCode))
      .limit(1);

    if (coupon && coupon.isActive) {
      const now = new Date();
      const startDate = coupon.startDate ? new Date(coupon.startDate) : null;
      const endDate = coupon.endDate ? new Date(coupon.endDate) : null;

      const isValid =
        (!startDate || now >= startDate) &&
        (!endDate || now <= endDate) &&
        (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) &&
        subtotal >= (coupon.minOrderAmount || 0);

      if (isValid) {
        if (coupon.discountType === "percentage") {
          discount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
            discount = coupon.maxDiscountAmount;
          }
        } else {
          discount = coupon.discountValue;
        }

        // Update coupon usage
        await db
          .update(coupons)
          .set({ usageCount: (coupon.usageCount || 0) + 1 })
          .where(eq(coupons.id, coupon.id));
      }
    }
  }

  // Calculate total
  const shippingCost = 0; // Can be configured
  const tax = 0; // Can be calculated based on region
  const total = subtotal - discount + shippingCost + tax;

  // Create order
  const [newOrder] = await db
    .insert(orders)
    .values({
      userId: req.user.id,
      orderNumber: generateOrderNumber(),
      subtotal,
      discount,
      tax,
      shippingCost,
      total,
      status: "pending",
      shippingAddressId,
      billingAddressId: billingAddressId || shippingAddressId,
      notes,
    })
    .returning();

  // Create order items
  const orderItemsWithOrderId = orderItemsData.map((item) => ({
    ...item,
    orderId: newOrder.id,
  }));

  await db.insert(orderItems).values(orderItemsWithOrderId);

  // Update product stock
  for (const item of items) {
    await db
      .update(products)
      .set({ stock: item.stock - item.quantity })
      .where(eq(products.id, item.productId));
  }

  // Clear cart
  await db.delete(cartItems).where(eq(cartItems.cartId, userCart.id));

  sendCreated(res, newOrder, "Order created successfully");
});

/**
 * @desc    Update order status (Admin)
 * @route   PUT /api/v1/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    throw new NotFoundError("Order");
  }

  const [updatedOrder] = await db
    .update(orders)
    .set({
      status,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(orders.id, id))
    .returning();

  sendSuccess(res, updatedOrder, "Order status updated");
});

/**
 * @desc    Cancel order
 * @route   POST /api/v1/orders/:id/cancel
 * @access  Private
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.userId, req.user.id)))
    .limit(1);

  if (!order) {
    throw new NotFoundError("Order");
  }

  if (!["pending", "confirmed"].includes(order.status)) {
    throw new AppError("Order cannot be cancelled", 400);
  }

  // Restore stock
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, id));

  for (const item of items) {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, item.productId))
      .limit(1);

    if (product) {
      await db
        .update(products)
        .set({ stock: product.stock + item.quantity })
        .where(eq(products.id, item.productId));
    }
  }

  const [updatedOrder] = await db
    .update(orders)
    .set({
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    })
    .where(eq(orders.id, id))
    .returning();

  sendSuccess(res, updatedOrder, "Order cancelled");
});
