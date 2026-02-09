import { eq, like, and, or, desc, asc, count, gte, lte } from "drizzle-orm";
import db from "../db/index.js";
import {
  products,
  categories,
  productVariants,
  productTags,
  tags,
} from "../db/schema/index.js";
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
  getSortParams,
} from "../utils/pagination.js";
import { getFileUrl, getFileUrls } from "../middleware/upload.middleware.js";

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
 * @desc    Get all products
 * @route   GET /api/v1/products
 * @access  Public
 */
export const getProducts = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPaginationParams(req.query);
  const { sortField, sortOrder } = getSortParams(
    req.query,
    ["name", "sellingPrice", "createdAt", "stock"],
    "createdAt",
    "desc",
  );

  const { search, categoryId, minPrice, maxPrice, isFeatured, isActive } =
    req.query;

  // Build where conditions
  const conditions = [];
  if (search) {
    conditions.push(
      or(
        like(products.name, `%${search}%`),
        like(products.shortDescription, `%${search}%`),
      ),
    );
  }
  if (categoryId) {
    conditions.push(eq(products.categoryId, parseInt(categoryId)));
  }
  if (minPrice) {
    conditions.push(gte(products.sellingPrice, parseFloat(minPrice)));
  }
  if (maxPrice) {
    conditions.push(lte(products.sellingPrice, parseFloat(maxPrice)));
  }
  if (isFeatured !== undefined) {
    conditions.push(eq(products.isFeatured, isFeatured === "true"));
  }
  if (isActive !== undefined) {
    conditions.push(eq(products.isActive, isActive === "true"));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(products)
    .where(whereClause);

  // Get products with category
  const orderBy =
    sortOrder === "asc" ? asc(products[sortField]) : desc(products[sortField]);

  const productList = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      featuredImage: products.featuredImage,
      mrp: products.mrp,
      sellingPrice: products.sellingPrice,
      discountPercentage: products.discountPercentage,
      stock: products.stock,
      sku: products.sku,
      categoryId: products.categoryId,
      categoryName: categories.name,
      isFeatured: products.isFeatured,
      isActive: products.isActive,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(whereClause)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  const pagination = buildPaginationMeta(total, page, limit);

  sendPaginated(res, productList, pagination, "Products fetched successfully");
});

/**
 * @desc    Get single product with variants
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
export const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      longDescription: products.longDescription,
      featuredImage: products.featuredImage,
      galleryImages: products.galleryImages,
      mrp: products.mrp,
      sellingPrice: products.sellingPrice,
      discountPercentage: products.discountPercentage,
      stock: products.stock,
      sku: products.sku,
      categoryId: products.categoryId,
      categoryName: categories.name,
      isFeatured: products.isFeatured,
      isActive: products.isActive,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, id))
    .limit(1);

  if (!product) {
    throw new NotFoundError("Product");
  }

  // Get variants
  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, id));

  // Get tags
  const productTagsList = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
    })
    .from(productTags)
    .innerJoin(tags, eq(productTags.tagId, tags.id))
    .where(eq(productTags.productId, id));

  // Parse gallery images
  const galleryImages = product.galleryImages
    ? JSON.parse(product.galleryImages)
    : [];

  sendSuccess(
    res,
    {
      ...product,
      galleryImages,
      variants,
      tags: productTagsList,
    },
    "Product fetched successfully",
  );
});

/**
 * @desc    Get product by slug
 * @route   GET /api/v1/products/slug/:slug
 * @access  Public
 */
export const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      longDescription: products.longDescription,
      featuredImage: products.featuredImage,
      galleryImages: products.galleryImages,
      mrp: products.mrp,
      sellingPrice: products.sellingPrice,
      discountPercentage: products.discountPercentage,
      stock: products.stock,
      sku: products.sku,
      categoryId: products.categoryId,
      categoryName: categories.name,
      isFeatured: products.isFeatured,
      isActive: products.isActive,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1);

  if (!product) {
    throw new NotFoundError("Product");
  }

  // Get variants
  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, product.id));

  // Get tags
  const productTagsList = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
    })
    .from(productTags)
    .innerJoin(tags, eq(productTags.tagId, tags.id))
    .where(eq(productTags.productId, product.id));

  // Parse gallery images
  const galleryImages = product.galleryImages
    ? JSON.parse(product.galleryImages)
    : [];

  sendSuccess(
    res,
    {
      ...product,
      galleryImages,
      variants,
      tags: productTagsList,
    },
    "Product fetched successfully",
  );
});

/**
 * @desc    Create product
 * @route   POST /api/v1/products
 * @access  Private/Admin
 */
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    slug,
    shortDescription,
    longDescription,
    mrp,
    sellingPrice,
    discountPercentage,
    stock,
    sku,
    categoryId,
    isFeatured,
    isActive,
    tagIds,
  } = req.body;

  const productSlug = slug || generateSlug(name);

  // Check slug uniqueness
  const [existingProduct] = await db
    .select()
    .from(products)
    .where(eq(products.slug, productSlug))
    .limit(1);

  if (existingProduct) {
    throw new ConflictError("Product with this slug already exists");
  }

  // Handle file uploads
  let featuredImage = null;
  let galleryImages = [];

  if (req.files) {
    if (req.files.featuredImage) {
      featuredImage = getFileUrl(req.files.featuredImage[0]);
    }
    if (req.files.galleryImages) {
      galleryImages = getFileUrls(req.files.galleryImages);
    }
  }

  // Calculate discount percentage if not provided
  const calculatedDiscount =
    discountPercentage ?? Math.round(((mrp - sellingPrice) / mrp) * 100);

  const [newProduct] = await db
    .insert(products)
    .values({
      name,
      slug: productSlug,
      shortDescription,
      longDescription,
      featuredImage,
      galleryImages: JSON.stringify(galleryImages),
      mrp,
      sellingPrice,
      discountPercentage: calculatedDiscount,
      stock: stock || 0,
      sku,
      categoryId,
      isFeatured: isFeatured || false,
      isActive: isActive !== undefined ? isActive : true,
    })
    .returning();

  // Add tags if provided
  if (tagIds && tagIds.length > 0) {
    const tagInserts = tagIds.map((tagId) => ({
      productId: newProduct.id,
      tagId,
    }));
    await db.insert(productTags).values(tagInserts);
  }

  sendCreated(res, newProduct, "Product created successfully");
});

/**
 * @desc    Update product
 * @route   PUT /api/v1/products/:id
 * @access  Private/Admin
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    slug,
    shortDescription,
    longDescription,
    mrp,
    sellingPrice,
    discountPercentage,
    stock,
    sku,
    categoryId,
    isFeatured,
    isActive,
    tagIds,
  } = req.body;

  const [existingProduct] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (!existingProduct) {
    throw new NotFoundError("Product");
  }

  // Check slug uniqueness if changing
  if (slug && slug !== existingProduct.slug) {
    const [slugExists] = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (slugExists) {
      throw new ConflictError("Product with this slug already exists");
    }
  }

  // Handle file uploads
  let featuredImage = existingProduct.featuredImage;
  let galleryImages = existingProduct.galleryImages;

  if (req.files) {
    if (req.files.featuredImage) {
      featuredImage = getFileUrl(req.files.featuredImage[0]);
    }
    if (req.files.galleryImages) {
      galleryImages = JSON.stringify(getFileUrls(req.files.galleryImages));
    }
  }

  const updateData = {
    ...(name && { name }),
    ...(slug && { slug }),
    ...(shortDescription !== undefined && { shortDescription }),
    ...(longDescription !== undefined && { longDescription }),
    ...(featuredImage && { featuredImage }),
    ...(galleryImages && { galleryImages }),
    ...(mrp && { mrp }),
    ...(sellingPrice && { sellingPrice }),
    ...(discountPercentage !== undefined && { discountPercentage }),
    ...(stock !== undefined && { stock }),
    ...(sku !== undefined && { sku }),
    ...(categoryId && { categoryId }),
    ...(isFeatured !== undefined && { isFeatured }),
    ...(isActive !== undefined && { isActive }),
    updatedAt: new Date().toISOString(),
  };

  const [updatedProduct] = await db
    .update(products)
    .set(updateData)
    .where(eq(products.id, id))
    .returning();

  // Update tags if provided
  if (tagIds !== undefined) {
    await db.delete(productTags).where(eq(productTags.productId, id));
    if (tagIds.length > 0) {
      const tagInserts = tagIds.map((tagId) => ({
        productId: id,
        tagId,
      }));
      await db.insert(productTags).values(tagInserts);
    }
  }

  sendSuccess(res, updatedProduct, "Product updated successfully");
});

/**
 * @desc    Delete product
 * @route   DELETE /api/v1/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existingProduct] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (!existingProduct) {
    throw new NotFoundError("Product");
  }

  await db.delete(products).where(eq(products.id, id));

  sendNoContent(res);
});
