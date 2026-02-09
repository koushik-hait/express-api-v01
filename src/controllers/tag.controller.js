import { eq, like, count } from "drizzle-orm";
import db from "../db/index.js";
import { tags } from "../db/schema/index.js";
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
 * Generate slug from name
 */
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

/**
 * @desc    Get all tags
 * @route   GET /api/v1/tags
 * @access  Public
 */
export const getTags = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPaginationParams(req.query);
  const { search } = req.query;

  // Build where conditions
  const whereClause = search ? like(tags.name, `%${search}%`) : undefined;

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(tags)
    .where(whereClause);

  // Get tags
  const tagList = await db
    .select()
    .from(tags)
    .where(whereClause)
    .limit(limit)
    .offset(offset);

  const pagination = buildPaginationMeta(total, page, limit);

  sendPaginated(res, tagList, pagination, "Tags fetched successfully");
});

/**
 * @desc    Get single tag
 * @route   GET /api/v1/tags/:id
 * @access  Public
 */
export const getTag = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [tag] = await db.select().from(tags).where(eq(tags.id, id)).limit(1);

  if (!tag) {
    throw new NotFoundError("Tag");
  }

  sendSuccess(res, tag, "Tag fetched successfully");
});

/**
 * @desc    Create tag
 * @route   POST /api/v1/tags
 * @access  Private/Admin
 */
export const createTag = asyncHandler(async (req, res) => {
  const { name, slug } = req.body;

  const tagSlug = slug || generateSlug(name);

  // Check slug uniqueness
  const [existingTag] = await db
    .select()
    .from(tags)
    .where(eq(tags.slug, tagSlug))
    .limit(1);

  if (existingTag) {
    throw new ConflictError("Tag with this slug already exists");
  }

  const [newTag] = await db
    .insert(tags)
    .values({
      name,
      slug: tagSlug,
    })
    .returning();

  sendCreated(res, newTag, "Tag created successfully");
});

/**
 * @desc    Update tag
 * @route   PUT /api/v1/tags/:id
 * @access  Private/Admin
 */
export const updateTag = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug } = req.body;

  const [existingTag] = await db
    .select()
    .from(tags)
    .where(eq(tags.id, id))
    .limit(1);

  if (!existingTag) {
    throw new NotFoundError("Tag");
  }

  // Check slug uniqueness if changing
  if (slug && slug !== existingTag.slug) {
    const [slugExists] = await db
      .select()
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1);

    if (slugExists) {
      throw new ConflictError("Tag with this slug already exists");
    }
  }

  const [updatedTag] = await db
    .update(tags)
    .set({
      ...(name && { name }),
      ...(slug && { slug }),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(tags.id, id))
    .returning();

  sendSuccess(res, updatedTag, "Tag updated successfully");
});

/**
 * @desc    Delete tag
 * @route   DELETE /api/v1/tags/:id
 * @access  Private/Admin
 */
export const deleteTag = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existingTag] = await db
    .select()
    .from(tags)
    .where(eq(tags.id, id))
    .limit(1);

  if (!existingTag) {
    throw new NotFoundError("Tag");
  }

  await db.delete(tags).where(eq(tags.id, id));

  sendNoContent(res);
});
