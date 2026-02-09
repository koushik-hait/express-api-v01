import { eq, and, desc, count } from "drizzle-orm";
import db from "../db/index.js";
import { notifications } from "../db/schema/index.js";
import { asyncHandler, NotFoundError } from "../utils/errors.js";
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
 * @desc    Get user's notifications
 * @route   GET /api/v1/notifications
 * @access  Private
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPaginationParams(req.query);

  const [{ total }] = await db
    .select({ total: count() })
    .from(notifications)
    .where(eq(notifications.userId, req.user.id));

  const notificationList = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, req.user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);

  // Get unread count
  const [{ unreadCount }] = await db
    .select({ unreadCount: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, req.user.id),
        eq(notifications.isRead, false),
      ),
    );

  const pagination = buildPaginationMeta(total, page, limit);

  sendPaginated(
    res,
    {
      notifications: notificationList,
      unreadCount,
    },
    pagination,
    "Notifications fetched successfully",
  );
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/v1/notifications/:id/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [notification] = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.id, id), eq(notifications.userId, req.user.id)))
    .limit(1);

  if (!notification) {
    throw new NotFoundError("Notification");
  }

  const [updated] = await db
    .update(notifications)
    .set({
      isRead: true,
      readAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(notifications.id, id))
    .returning();

  sendSuccess(res, updated, "Notification marked as read");
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/v1/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  await db
    .update(notifications)
    .set({
      isRead: true,
      readAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(
        eq(notifications.userId, req.user.id),
        eq(notifications.isRead, false),
      ),
    );

  sendSuccess(res, null, "All notifications marked as read");
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/v1/notifications/:id
 * @access  Private
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [notification] = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.id, id), eq(notifications.userId, req.user.id)))
    .limit(1);

  if (!notification) {
    throw new NotFoundError("Notification");
  }

  await db.delete(notifications).where(eq(notifications.id, id));

  sendNoContent(res);
});

/**
 * @desc    Create notification (Admin/System)
 * @route   POST /api/v1/notifications
 * @access  Private/Admin
 */
export const createNotification = asyncHandler(async (req, res) => {
  const { userId, type, title, message, data } = req.body;

  const [newNotification] = await db
    .insert(notifications)
    .values({
      userId,
      type: type || "info",
      title,
      message,
      data,
    })
    .returning();

  sendCreated(res, newNotification, "Notification created");
});
