import { eq, like, and, count } from "drizzle-orm";
import db from "../db/index.js";
import { coupons } from "../db/schema/index.js";
import {
  asyncHandler,
  NotFoundError,
  ConflictError,
  AppError,
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
 * @desc    Get all coupons
 * @route   GET /api/v1/coupons
 * @access  Private/Admin
 */
export const getCoupons = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPaginationParams(req.query);
  const { search, isActive } = req.query;

  const conditions = [];
  if (search) {
    conditions.push(like(coupons.code, `%${search.toUpperCase()}%`));
  }
  if (isActive !== undefined) {
    conditions.push(eq(coupons.isActive, isActive === "true"));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ total }] = await db
    .select({ total: count() })
    .from(coupons)
    .where(whereClause);

  const couponList = await db
    .select()
    .from(coupons)
    .where(whereClause)
    .limit(limit)
    .offset(offset);

  const pagination = buildPaginationMeta(total, page, limit);

  sendPaginated(res, couponList, pagination, "Coupons fetched successfully");
});

/**
 * @desc    Get single coupon
 * @route   GET /api/v1/coupons/:id
 * @access  Private/Admin
 */
export const getCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [coupon] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.id, id))
    .limit(1);

  if (!coupon) {
    throw new NotFoundError("Coupon");
  }

  sendSuccess(res, coupon, "Coupon fetched successfully");
});

/**
 * @desc    Create coupon
 * @route   POST /api/v1/coupons
 * @access  Private/Admin
 */
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    type,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscountAmount,
    startDate,
    endDate,
    usageLimit,
    isActive,
  } = req.body;

  // Check if code exists
  const [existing] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, code.toUpperCase()))
    .limit(1);

  if (existing) {
    throw new ConflictError("Coupon code already exists");
  }

  const [newCoupon] = await db
    .insert(coupons)
    .values({
      code: code.toUpperCase(),
      type: type || "discount",
      discountType: discountType || "percentage",
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      isActive: isActive !== undefined ? isActive : true,
    })
    .returning();

  sendCreated(res, newCoupon, "Coupon created successfully");
});

/**
 * @desc    Update coupon
 * @route   PUT /api/v1/coupons/:id
 * @access  Private/Admin
 */
export const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const [existing] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.id, id))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Coupon");
  }

  if (updateData.code && updateData.code !== existing.code) {
    const [codeExists] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, updateData.code.toUpperCase()))
      .limit(1);

    if (codeExists) {
      throw new ConflictError("Coupon code already exists");
    }
    updateData.code = updateData.code.toUpperCase();
  }

  const [updatedCoupon] = await db
    .update(coupons)
    .set({
      ...updateData,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(coupons.id, id))
    .returning();

  sendSuccess(res, updatedCoupon, "Coupon updated successfully");
});

/**
 * @desc    Delete coupon
 * @route   DELETE /api/v1/coupons/:id
 * @access  Private/Admin
 */
export const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existing] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.id, id))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Coupon");
  }

  await db.delete(coupons).where(eq(coupons.id, id));

  sendNoContent(res);
});

/**
 * @desc    Validate coupon code
 * @route   POST /api/v1/coupons/validate
 * @access  Private
 */
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderTotal } = req.body;

  const [coupon] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, code.toUpperCase()))
    .limit(1);

  if (!coupon) {
    throw new NotFoundError("Coupon");
  }

  if (!coupon.isActive) {
    throw new AppError("Coupon is not active", 400);
  }

  const now = new Date();
  if (coupon.startDate && new Date(coupon.startDate) > now) {
    throw new AppError("Coupon is not yet valid", 400);
  }

  if (coupon.endDate && new Date(coupon.endDate) < now) {
    throw new AppError("Coupon has expired", 400);
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    throw new AppError("Coupon usage limit reached", 400);
  }

  if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount) {
    throw new AppError(`Minimum order amount is ${coupon.minOrderAmount}`, 400);
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = (orderTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else {
    discount = coupon.discountValue;
  }

  sendSuccess(
    res,
    {
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount,
      finalTotal: orderTotal - discount,
    },
    "Coupon is valid",
  );
});
