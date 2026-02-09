import { eq, like, and, or, desc, asc, count, isNull } from "drizzle-orm";
import db from "../db/index.js";
import { categories } from "../db/schema/index.js";
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
 * @desc    Get all categories
 * @route   GET /api/v1/categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPaginationParams(req.query);
  const { search, parentId, isActive } = req.query;

  // Build where conditions
  const conditions = [];
  if (search) {
    conditions.push(like(categories.name, `%${search}%`));
  }
  if (parentId !== undefined) {
    if (parentId === "null" || parentId === "") {
      conditions.push(isNull(categories.parentId));
    } else {
      conditions.push(eq(categories.parentId, parseInt(parentId)));
    }
  }
  if (isActive !== undefined) {
    conditions.push(eq(categories.isActive, isActive === "true"));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(categories)
    .where(whereClause);

  // Get categories
  const categoryList = await db
    .select()
    .from(categories)
    .where(whereClause)
    .orderBy(asc(categories.sortOrder), asc(categories.name))
    .limit(limit)
    .offset(offset);

  const pagination = buildPaginationMeta(total, page, limit);

  sendPaginated(
    res,
    categoryList,
    pagination,
    "Categories fetched successfully",
  );
});

/**
 * @desc    Get category tree (nested)
 * @route   GET /api/v1/categories/tree
 * @access  Public
 */
export const getCategoryTree = asyncHandler(async (req, res) => {
  const allCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder), asc(categories.name));

  // Build tree structure
  const categoryMap = new Map();
  const tree = [];

  allCategories.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  allCategories.forEach((cat) => {
    const category = categoryMap.get(cat.id);
    if (cat.parentId && categoryMap.has(cat.parentId)) {
      categoryMap.get(cat.parentId).children.push(category);
    } else {
      tree.push(category);
    }
  });

  sendSuccess(res, tree, "Category tree fetched successfully");
});

/**
 * @desc    Get single category
 * @route   GET /api/v1/categories/:id
 * @access  Public
 */
export const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  if (!category) {
    throw new NotFoundError("Category");
  }

  sendSuccess(res, category, "Category fetched successfully");
});

/**
 * @desc    Create category
 * @route   POST /api/v1/categories
 * @access  Private/Admin
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, parentId, isActive, sortOrder } = req.body;

  const categorySlug = slug || generateSlug(name);

  // Check slug uniqueness
  const [existingCategory] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, categorySlug))
    .limit(1);

  if (existingCategory) {
    throw new ConflictError("Category with this slug already exists");
  }

  const [newCategory] = await db
    .insert(categories)
    .values({
      name,
      slug: categorySlug,
      description,
      parentId: parentId || null,
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder || 0,
    })
    .returning();

  sendCreated(res, newCategory, "Category created successfully");
});

/**
 * @desc    Update category
 * @route   PUT /api/v1/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug, description, parentId, isActive, sortOrder, image } =
    req.body;

  const [existingCategory] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  if (!existingCategory) {
    throw new NotFoundError("Category");
  }

  // Check slug uniqueness if changing
  if (slug && slug !== existingCategory.slug) {
    const [slugExists] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    if (slugExists) {
      throw new ConflictError("Category with this slug already exists");
    }
  }

  const [updatedCategory] = await db
    .update(categories)
    .set({
      ...(name && { name }),
      ...(slug && { slug }),
      ...(description !== undefined && { description }),
      ...(parentId !== undefined && { parentId }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(image !== undefined && { image }),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(categories.id, id))
    .returning();

  sendSuccess(res, updatedCategory, "Category updated successfully");
});

/**
 * @desc    Delete category
 * @route   DELETE /api/v1/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existingCategory] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  if (!existingCategory) {
    throw new NotFoundError("Category");
  }

  await db.delete(categories).where(eq(categories.id, id));

  sendNoContent(res);
});
