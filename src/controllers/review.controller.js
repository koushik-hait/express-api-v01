import { eq, and, desc, asc, count } from "drizzle-orm";
import db from "../db/index.js";
import {
  reviews,
  products,
  users,
  orderItems,
  orders,
} from "../db/schema/index.js";
import {
  asyncHandler,
  NotFoundError,
  ConflictError,
  AuthorizationError,
} from "../utils/errors.js";
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendNoContent,
} from "../utils/response.js";
import {
  getPaginationParams,
  buildPaginationMeta,
} from "../utils/pagination.js";

/**
 * @desc    Get reviews for a product
 * @route   GET /api/v1/products/:productId/reviews
 * @access  Public
 */
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page, limit, offset } = getPaginationParams(req.query);

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(reviews)
    .where(
      and(
        eq(reviews.productId, parseInt(productId)),
        eq(reviews.isApproved, true),
      ),
    );

  // Get reviews
  const reviewList = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      comment: reviews.comment,
      isVerified: reviews.isVerified,
      createdAt: reviews.createdAt,
      userName: users.name,
      userAvatar: users.avatar,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(
      and(
        eq(reviews.productId, parseInt(productId)),
        eq(reviews.isApproved, true),
      ),
    )
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);

  // Calculate average rating
  const allRatings = await db
    .select({ rating: reviews.rating })
    .from(reviews)
    .where(
      and(
        eq(reviews.productId, parseInt(productId)),
        eq(reviews.isApproved, true),
      ),
    );

  const avgRating =
    allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
      : 0;

  const pagination = buildPaginationMeta(total, page, limit);

  sendPaginated(
    res,
    {
      reviews: reviewList,
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews: total,
    },
    pagination,
    "Reviews fetched successfully",
  );
});

/**
 * @desc    Create review
 * @route   POST /api/v1/reviews
 * @access  Private
 */
export const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, title, comment } = req.body;

  // Check if product exists
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) {
    throw new NotFoundError("Product");
  }

  // Check if user already reviewed this product
  const [existing] = await db
    .select()
    .from(reviews)
    .where(
      and(eq(reviews.userId, req.user.id), eq(reviews.productId, productId)),
    )
    .limit(1);

  if (existing) {
    throw new ConflictError("You have already reviewed this product");
  }

  // Check if user has purchased this product (verified purchase)
  const purchasedItems = await db
    .select()
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(orders.userId, req.user.id),
        eq(orderItems.productId, productId),
        eq(orders.status, "delivered"),
      ),
    )
    .limit(1);

  const isVerified = purchasedItems.length > 0;

  const [newReview] = await db
    .insert(reviews)
    .values({
      userId: req.user.id,
      productId,
      rating,
      title,
      comment,
      isVerified,
      isApproved: true, // Auto-approve for now
    })
    .returning();

  sendCreated(res, newReview, "Review created successfully");
});

/**
 * @desc    Update review
 * @route   PUT /api/v1/reviews/:id
 * @access  Private
 */
export const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, title, comment } = req.body;

  const [review] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, id))
    .limit(1);

  if (!review) {
    throw new NotFoundError("Review");
  }

  if (review.userId !== req.user.id) {
    throw new AuthorizationError("You can only update your own reviews");
  }

  const [updatedReview] = await db
    .update(reviews)
    .set({
      ...(rating && { rating }),
      ...(title !== undefined && { title }),
      ...(comment !== undefined && { comment }),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(reviews.id, id))
    .returning();

  sendSuccess(res, updatedReview, "Review updated successfully");
});

/**
 * @desc    Delete review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private
 */
export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [review] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, id))
    .limit(1);

  if (!review) {
    throw new NotFoundError("Review");
  }

  // Allow user to delete their own review or admin to delete any
  if (review.userId !== req.user.id && req.user.roleName !== "admin") {
    throw new AuthorizationError("You can only delete your own reviews");
  }

  await db.delete(reviews).where(eq(reviews.id, id));

  sendNoContent(res);
});

/**
 * @desc    Get user's reviews
 * @route   GET /api/v1/reviews/my
 * @access  Private
 */
export const getMyReviews = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPaginationParams(req.query);

  const [{ total }] = await db
    .select({ total: count() })
    .from(reviews)
    .where(eq(reviews.userId, req.user.id));

  const myReviews = await db
    .select({
      id: reviews.id,
      productId: reviews.productId,
      rating: reviews.rating,
      title: reviews.title,
      comment: reviews.comment,
      isVerified: reviews.isVerified,
      isApproved: reviews.isApproved,
      createdAt: reviews.createdAt,
      productName: products.name,
      productImage: products.featuredImage,
    })
    .from(reviews)
    .innerJoin(products, eq(reviews.productId, products.id))
    .where(eq(reviews.userId, req.user.id))
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);

  const pagination = buildPaginationMeta(total, page, limit);

  sendPaginated(res, myReviews, pagination, "Reviews fetched successfully");
});
