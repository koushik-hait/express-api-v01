import { eq, count } from "drizzle-orm";
import db from "../db/index.js";
import { productVariants, products } from "../db/schema/index.js";
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
 * @desc    Get all variants for a product
 * @route   GET /api/v1/products/:productId/variants
 * @access  Public
 */
export const getVariants = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // Check if product exists
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, parseInt(productId)))
    .limit(1);

  if (!product) {
    throw new NotFoundError("Product");
  }

  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, parseInt(productId)));

  sendSuccess(res, variants, "Variants fetched successfully");
});

/**
 * @desc    Get single variant
 * @route   GET /api/v1/variants/:id
 * @access  Public
 */
export const getVariant = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [variant] = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.id, id))
    .limit(1);

  if (!variant) {
    throw new NotFoundError("Variant");
  }

  sendSuccess(res, variant, "Variant fetched successfully");
});

/**
 * @desc    Create variant
 * @route   POST /api/v1/variants
 * @access  Private/Admin
 */
export const createVariant = asyncHandler(async (req, res) => {
  const { productId, key, value, priceModifier, stockModifier, sku } = req.body;

  // Check if product exists
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) {
    throw new NotFoundError("Product");
  }

  const [newVariant] = await db
    .insert(productVariants)
    .values({
      productId,
      key,
      value,
      priceModifier: priceModifier || 0,
      stockModifier: stockModifier || 0,
      sku,
    })
    .returning();

  sendCreated(res, newVariant, "Variant created successfully");
});

/**
 * @desc    Update variant
 * @route   PUT /api/v1/variants/:id
 * @access  Private/Admin
 */
export const updateVariant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { key, value, priceModifier, stockModifier, sku } = req.body;

  const [existingVariant] = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.id, id))
    .limit(1);

  if (!existingVariant) {
    throw new NotFoundError("Variant");
  }

  const [updatedVariant] = await db
    .update(productVariants)
    .set({
      ...(key && { key }),
      ...(value && { value }),
      ...(priceModifier !== undefined && { priceModifier }),
      ...(stockModifier !== undefined && { stockModifier }),
      ...(sku !== undefined && { sku }),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(productVariants.id, id))
    .returning();

  sendSuccess(res, updatedVariant, "Variant updated successfully");
});

/**
 * @desc    Delete variant
 * @route   DELETE /api/v1/variants/:id
 * @access  Private/Admin
 */
export const deleteVariant = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existingVariant] = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.id, id))
    .limit(1);

  if (!existingVariant) {
    throw new NotFoundError("Variant");
  }

  await db.delete(productVariants).where(eq(productVariants.id, id));

  sendNoContent(res);
});
