import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import db from "../db/index.js";
import { users, roles, sessions } from "../db/schema/index.js";
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  asyncHandler,
} from "../utils/errors.js";
import { sendSuccess, sendCreated } from "../utils/response.js";

/**
 * Generate JWT tokens
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });

  return { accessToken, refreshToken };
};

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Check if user already exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    throw new ConflictError("User with this email already exists");
  }

  // Get default customer role
  const [customerRole] = await db
    .select()
    .from(roles)
    .where(eq(roles.name, "customer"))
    .limit(1);

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
      roleId: customerRole?.id || 2,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
    });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(newUser.id);

  // Save session
  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  await db.insert(sessions).values({
    userId: newUser.id,
    token: refreshToken,
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
    expiresAt,
  });

  sendCreated(
    res,
    {
      user: newUser,
      accessToken,
      refreshToken,
    },
    "Registration successful",
  );
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Get user with role
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      password: users.password,
      phone: users.phone,
      avatar: users.avatar,
      isActive: users.isActive,
      roleId: users.roleId,
      roleName: roles.name,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    throw new AuthenticationError("Invalid email or password");
  }

  if (!user.isActive) {
    throw new AuthenticationError("Account is deactivated");
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AuthenticationError("Invalid email or password");
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id);

  // Save session
  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  await db.insert(sessions).values({
    userId: user.id,
    token: refreshToken,
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
    expiresAt,
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  sendSuccess(
    res,
    {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    },
    "Login successful",
  );
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Delete session
    await db.delete(sessions).where(eq(sessions.token, refreshToken));
  }

  sendSuccess(res, null, "Logout successful");
});

/**
 * @desc    Get current user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const me = asyncHandler(async (req, res) => {
  sendSuccess(res, { user: req.user }, "User fetched successfully");
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new AuthenticationError("Refresh token required");
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new AuthenticationError("Invalid or expired refresh token");
  }

  // Check if session exists
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  if (!session) {
    throw new AuthenticationError("Session not found or expired");
  }

  // Check if session is expired
  if (new Date(session.expiresAt) < new Date()) {
    await db.delete(sessions).where(eq(sessions.id, session.id));
    throw new AuthenticationError("Session expired");
  }

  // Get user
  const [user] = await db
    .select({
      id: users.id,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, decoded.userId))
    .limit(1);

  if (!user || !user.isActive) {
    throw new AuthenticationError("User not found or deactivated");
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    user.id,
  );

  // Update session with new refresh token
  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  await db
    .update(sessions)
    .set({
      token: newRefreshToken,
      expiresAt,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(sessions.id, session.id));

  sendSuccess(
    res,
    {
      accessToken,
      refreshToken: newRefreshToken,
    },
    "Token refreshed successfully",
  );
});
