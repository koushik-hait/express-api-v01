import { eq, and } from "drizzle-orm";
import db from "../db/index.js";
import {
  cart,
  cartItems,
  products,
  productVariants,
} from "../db/schema/index.js";
import { asyncHandler, NotFoundError, AppError } from "../utils/errors.js";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/response.js";

/**
 * Get or create cart for user
 */
const getOrCreateCart = async (userId) => {
  let [userCart] = await db
    .select()
    .from(cart)
    .where(eq(cart.userId, userId))
    .limit(1);

  if (!userCart) {
    [userCart] = await db.insert(cart).values({ userId }).returning();
  }

  return userCart;
};

/**
 * @desc    Get user's cart
 * @route   GET /api/v1/cart
 * @access  Private
 */
export const getCart = asyncHandler(async (req, res) => {
  const userCart = await getOrCreateCart(req.user.id);

  // Get cart items with product details
  const items = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      variantId: cartItems.variantId,
      quantity: cartItems.quantity,
      productName: products.name,
      productImage: products.featuredImage,
      productSlug: products.slug,
      mrp: products.mrp,
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

  // Calculate totals
  let subtotal = 0;
  const formattedItems = items.map((item) => {
    const unitPrice = item.sellingPrice + (item.priceModifier || 0);
    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;

    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      product: {
        name: item.productName,
        slug: item.productSlug,
        image: item.productImage,
        mrp: item.mrp,
        sellingPrice: item.sellingPrice,
        stock: item.stock,
      },
      variant: item.variantId
        ? {
            key: item.variantKey,
            value: item.variantValue,
            priceModifier: item.priceModifier,
          }
        : null,
      unitPrice,
      totalPrice,
    };
  });

  sendSuccess(
    res,
    {
      id: userCart.id,
      items: formattedItems,
      itemCount: formattedItems.length,
      subtotal,
    },
    "Cart fetched successfully",
  );
});

/**
 * @desc    Add item to cart
 * @route   POST /api/v1/cart/items
 * @access  Private
 */
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, variantId, quantity } = req.body;

  // Check if product exists and has stock
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) {
    throw new NotFoundError("Product");
  }

  if (product.stock < quantity) {
    throw new AppError("Insufficient stock", 400);
  }

  const userCart = await getOrCreateCart(req.user.id);

  // Check if item already exists in cart
  const whereConditions = [
    eq(cartItems.cartId, userCart.id),
    eq(cartItems.productId, productId),
  ];
  if (variantId) {
    whereConditions.push(eq(cartItems.variantId, variantId));
  }

  const [existingItem] = await db
    .select()
    .from(cartItems)
    .where(and(...whereConditions))
    .limit(1);

  if (existingItem) {
    // Update quantity
    const newQuantity = existingItem.quantity + quantity;
    if (product.stock < newQuantity) {
      throw new AppError("Insufficient stock", 400);
    }

    const [updatedItem] = await db
      .update(cartItems)
      .set({
        quantity: newQuantity,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(cartItems.id, existingItem.id))
      .returning();

    sendSuccess(res, updatedItem, "Cart item updated");
  } else {
    // Add new item
    const [newItem] = await db
      .insert(cartItems)
      .values({
        cartId: userCart.id,
        productId,
        variantId: variantId || null,
        quantity,
      })
      .returning();

    sendCreated(res, newItem, "Item added to cart");
  }
});

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/v1/cart/items/:id
 * @access  Private
 */
export const updateCartItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const userCart = await getOrCreateCart(req.user.id);

  const [item] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.id, id), eq(cartItems.cartId, userCart.id)))
    .limit(1);

  if (!item) {
    throw new NotFoundError("Cart item");
  }

  // Check stock
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, item.productId))
    .limit(1);

  if (product.stock < quantity) {
    throw new AppError("Insufficient stock", 400);
  }

  const [updatedItem] = await db
    .update(cartItems)
    .set({
      quantity,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(cartItems.id, id))
    .returning();

  sendSuccess(res, updatedItem, "Cart item updated");
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/v1/cart/items/:id
 * @access  Private
 */
export const removeCartItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const userCart = await getOrCreateCart(req.user.id);

  const [item] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.id, id), eq(cartItems.cartId, userCart.id)))
    .limit(1);

  if (!item) {
    throw new NotFoundError("Cart item");
  }

  await db.delete(cartItems).where(eq(cartItems.id, id));

  sendNoContent(res);
});

/**
 * @desc    Clear cart
 * @route   DELETE /api/v1/cart
 * @access  Private
 */
export const clearCart = asyncHandler(async (req, res) => {
  const userCart = await getOrCreateCart(req.user.id);

  await db.delete(cartItems).where(eq(cartItems.cartId, userCart.id));

  sendSuccess(res, null, "Cart cleared");
});
