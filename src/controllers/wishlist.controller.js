import { eq, and } from "drizzle-orm";
import db from "../db/index.js";
import { wishlist, products } from "../db/schema/index.js";
import { asyncHandler, NotFoundError, ConflictError } from "../utils/errors.js";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/response.js";

/**
 * @desc    Get user's wishlist
 * @route   GET /api/v1/wishlist
 * @access  Private
 */
export const getWishlist = asyncHandler(async (req, res) => {
  const items = await db
    .select({
      id: wishlist.id,
      productId: wishlist.productId,
      createdAt: wishlist.createdAt,
      productName: products.name,
      productSlug: products.slug,
      productImage: products.featuredImage,
      mrp: products.mrp,
      sellingPrice: products.sellingPrice,
      stock: products.stock,
    })
    .from(wishlist)
    .innerJoin(products, eq(wishlist.productId, products.id))
    .where(eq(wishlist.userId, req.user.id));

  sendSuccess(res, items, "Wishlist fetched successfully");
});

/**
 * @desc    Add to wishlist
 * @route   POST /api/v1/wishlist
 * @access  Private
 */
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  // Check if product exists
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) {
    throw new NotFoundError("Product");
  }

  // Check if already in wishlist
  const [existing] = await db
    .select()
    .from(wishlist)
    .where(
      and(eq(wishlist.userId, req.user.id), eq(wishlist.productId, productId)),
    )
    .limit(1);

  if (existing) {
    throw new ConflictError("Product already in wishlist");
  }

  const [newItem] = await db
    .insert(wishlist)
    .values({
      userId: req.user.id,
      productId,
    })
    .returning();

  sendCreated(res, newItem, "Added to wishlist");
});

/**
 * @desc    Remove from wishlist
 * @route   DELETE /api/v1/wishlist/:id
 * @access  Private
 */
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [item] = await db
    .select()
    .from(wishlist)
    .where(and(eq(wishlist.id, id), eq(wishlist.userId, req.user.id)))
    .limit(1);

  if (!item) {
    throw new NotFoundError("Wishlist item");
  }

  await db.delete(wishlist).where(eq(wishlist.id, id));

  sendNoContent(res);
});

/**
 * @desc    Check if product is in wishlist
 * @route   GET /api/v1/wishlist/check/:productId
 * @access  Private
 */
export const checkWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const [item] = await db
    .select()
    .from(wishlist)
    .where(
      and(
        eq(wishlist.userId, req.user.id),
        eq(wishlist.productId, parseInt(productId)),
      ),
    )
    .limit(1);

  sendSuccess(res, { inWishlist: !!item }, "Wishlist status checked");
});
