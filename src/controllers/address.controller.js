import { eq, and } from "drizzle-orm";
import db from "../db/index.js";
import { addresses } from "../db/schema/index.js";
import { asyncHandler, NotFoundError } from "../utils/errors.js";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/response.js";

/**
 * @desc    Get user's addresses
 * @route   GET /api/v1/addresses
 * @access  Private
 */
export const getAddresses = asyncHandler(async (req, res) => {
  const addressList = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, req.user.id));

  sendSuccess(res, addressList, "Addresses fetched successfully");
});

/**
 * @desc    Get single address
 * @route   GET /api/v1/addresses/:id
 * @access  Private
 */
export const getAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [address] = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, req.user.id)))
    .limit(1);

  if (!address) {
    throw new NotFoundError("Address");
  }

  sendSuccess(res, address, "Address fetched successfully");
});

/**
 * @desc    Create address
 * @route   POST /api/v1/addresses
 * @access  Private
 */
export const createAddress = asyncHandler(async (req, res) => {
  const {
    label,
    fullName,
    phone,
    landmark,
    addressLine1,
    addressLine2,
    city,
    state,
    zip,
    country,
    isDefault,
  } = req.body;

  // If this is set as default, unset other defaults
  if (isDefault) {
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, req.user.id));
  }

  const [newAddress] = await db
    .insert(addresses)
    .values({
      userId: req.user.id,
      label,
      fullName,
      phone,
      landmark,
      addressLine1,
      addressLine2,
      city,
      state,
      zip,
      country: country || "India",
      isDefault: isDefault || false,
    })
    .returning();

  sendCreated(res, newAddress, "Address created successfully");
});

/**
 * @desc    Update address
 * @route   PUT /api/v1/addresses/:id
 * @access  Private
 */
export const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    label,
    fullName,
    phone,
    landmark,
    addressLine1,
    addressLine2,
    city,
    state,
    zip,
    country,
    isDefault,
  } = req.body;

  const [existing] = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, req.user.id)))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Address");
  }

  // If this is set as default, unset other defaults
  if (isDefault) {
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, req.user.id));
  }

  const [updatedAddress] = await db
    .update(addresses)
    .set({
      ...(label !== undefined && { label }),
      ...(fullName && { fullName }),
      ...(phone && { phone }),
      ...(landmark !== undefined && { landmark }),
      ...(addressLine1 && { addressLine1 }),
      ...(addressLine2 !== undefined && { addressLine2 }),
      ...(city && { city }),
      ...(state && { state }),
      ...(zip && { zip }),
      ...(country && { country }),
      ...(isDefault !== undefined && { isDefault }),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(addresses.id, id))
    .returning();

  sendSuccess(res, updatedAddress, "Address updated successfully");
});

/**
 * @desc    Delete address
 * @route   DELETE /api/v1/addresses/:id
 * @access  Private
 */
export const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existing] = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, req.user.id)))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Address");
  }

  await db.delete(addresses).where(eq(addresses.id, id));

  sendNoContent(res);
});

/**
 * @desc    Set address as default
 * @route   POST /api/v1/addresses/:id/default
 * @access  Private
 */
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existing] = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, req.user.id)))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Address");
  }

  // Unset all other defaults
  await db
    .update(addresses)
    .set({ isDefault: false })
    .where(eq(addresses.userId, req.user.id));

  // Set this as default
  const [updatedAddress] = await db
    .update(addresses)
    .set({ isDefault: true, updatedAt: new Date().toISOString() })
    .where(eq(addresses.id, id))
    .returning();

  sendSuccess(res, updatedAddress, "Default address updated");
});
