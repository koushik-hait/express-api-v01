import bcrypt from "bcryptjs";
import { eq, like, and, or, desc, asc, count } from "drizzle-orm";
import db from "../db/index.js";
import { users, roles } from "../db/schema/index.js";
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

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPaginationParams(req.query);
  const { sortField, sortOrder } = getSortParams(
    req.query,
    ["name", "email", "createdAt"],
    "createdAt",
    "desc",
  );

  const { search, roleId, isActive } = req.query;

  // Build where conditions
  const conditions = [];
  if (search) {
    conditions.push(
      or(like(users.name, `%${search}%`), like(users.email, `%${search}%`)),
    );
  }
  if (roleId) {
    conditions.push(eq(users.roleId, parseInt(roleId)));
  }
  if (isActive !== undefined) {
    conditions.push(eq(users.isActive, isActive === "true"));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(users)
    .where(whereClause);

  // Get users
  const orderBy =
    sortOrder === "asc" ? asc(users[sortField]) : desc(users[sortField]);

  const userList = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      avatar: users.avatar,
      roleId: users.roleId,
      roleName: roles.name,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(whereClause)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  const pagination = buildPaginationMeta(total, page, limit);

  sendPaginated(res, userList, pagination, "Users fetched successfully");
});

/**
 * @desc    Get single user
 * @route   GET /api/v1/users/:id
 * @access  Private/Admin
 */
export const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      avatar: users.avatar,
      roleId: users.roleId,
      roleName: roles.name,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.id, id))
    .limit(1);

  if (!user) {
    throw new NotFoundError("User");
  }

  sendSuccess(res, user, "User fetched successfully");
});

/**
 * @desc    Create user
 * @route   POST /api/v1/users
 * @access  Private/Admin
 */
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, roleId, isActive } = req.body;

  // Check if user exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    throw new ConflictError("User with this email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const [newUser] = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashedPassword,
      phone,
      roleId: roleId || 2,
      isActive: isActive !== undefined ? isActive : true,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      roleId: users.roleId,
      isActive: users.isActive,
      createdAt: users.createdAt,
    });

  sendCreated(res, newUser, "User created successfully");
});

/**
 * @desc    Update user
 * @route   PUT /api/v1/users/:id
 * @access  Private/Admin
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, roleId, isActive } = req.body;

  // Check if user exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!existingUser) {
    throw new NotFoundError("User");
  }

  // Check email uniqueness
  if (email && email !== existingUser.email) {
    const [emailExists] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (emailExists) {
      throw new ConflictError("Email already in use");
    }
  }

  // Update user
  const [updatedUser] = await db
    .update(users)
    .set({
      ...(name && { name }),
      ...(email && { email }),
      ...(phone !== undefined && { phone }),
      ...(roleId && { roleId }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      roleId: users.roleId,
      isActive: users.isActive,
      updatedAt: users.updatedAt,
    });

  sendSuccess(res, updatedUser, "User updated successfully");
});

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!existingUser) {
    throw new NotFoundError("User");
  }

  await db.delete(users).where(eq(users.id, id));

  sendNoContent(res);
});
