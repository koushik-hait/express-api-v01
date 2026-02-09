import { eq, count } from "drizzle-orm";
import db from "../db/index.js";
import { newsletters } from "../db/schema/index.js";
import { asyncHandler, NotFoundError, ConflictError } from "../utils/errors.js";
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
 * @desc    Subscribe to newsletter
 * @route   POST /api/v1/newsletters/subscribe
 * @access  Public
 */
export const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const [existing] = await db
    .select()
    .from(newsletters)
    .where(eq(newsletters.email, email.toLowerCase()))
    .limit(1);

  if (existing) {
    if (existing.isActive) {
      throw new ConflictError("Email already subscribed");
    }
    // Reactivate subscription
    await db
      .update(newsletters)
      .set({
        isActive: true,
        subscribedAt: new Date().toISOString(),
        unsubscribedAt: null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(newsletters.id, existing.id));

    sendSuccess(res, null, "Subscription reactivated");
    return;
  }

  await db.insert(newsletters).values({
    email: email.toLowerCase(),
  });

  sendCreated(res, null, "Subscribed successfully");
});

/**
 * @desc    Unsubscribe from newsletter
 * @route   POST /api/v1/newsletters/unsubscribe
 * @access  Public
 */
export const unsubscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const [existing] = await db
    .select()
    .from(newsletters)
    .where(eq(newsletters.email, email.toLowerCase()))
    .limit(1);

  if (!existing || !existing.isActive) {
    throw new NotFoundError("Subscription");
  }

  await db
    .update(newsletters)
    .set({
      isActive: false,
      unsubscribedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(newsletters.id, existing.id));

  sendSuccess(res, null, "Unsubscribed successfully");
});

/**
 * @desc    Get all subscribers
 * @route   GET /api/v1/newsletters
 * @access  Private/Admin
 */
export const getSubscribers = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPaginationParams(req.query);
  const { isActive } = req.query;

  const whereClause =
    isActive !== undefined
      ? eq(newsletters.isActive, isActive === "true")
      : undefined;

  const [{ total }] = await db
    .select({ total: count() })
    .from(newsletters)
    .where(whereClause);

  const subscriberList = await db
    .select()
    .from(newsletters)
    .where(whereClause)
    .limit(limit)
    .offset(offset);

  const pagination = buildPaginationMeta(total, page, limit);

  sendPaginated(
    res,
    subscriberList,
    pagination,
    "Subscribers fetched successfully",
  );
});

/**
 * @desc    Delete subscriber
 * @route   DELETE /api/v1/newsletters/:id
 * @access  Private/Admin
 */
export const deleteSubscriber = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existing] = await db
    .select()
    .from(newsletters)
    .where(eq(newsletters.id, id))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Subscriber");
  }

  await db.delete(newsletters).where(eq(newsletters.id, id));

  sendNoContent(res);
});
