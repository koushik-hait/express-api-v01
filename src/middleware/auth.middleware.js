import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import db from "../db/index.js";
import { users, roles } from "../db/schema/index.js";
import { AuthenticationError, AuthorizationError } from "../utils/errors.js";

/**
 * Extract token from Authorization header
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
};

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new AuthenticationError("Access token required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        avatar: users.avatar,
        roleId: users.roleId,
        isActive: users.isActive,
        roleName: roles.name,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user) {
      throw new AuthenticationError("User not found");
    }

    if (!user.isActive) {
      throw new AuthenticationError("Account is deactivated");
    }

    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return next(new AuthenticationError("Invalid or expired token"));
    }
    next(error);
  }
};

/**
 * Optional authentication - attaches user if token present, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        avatar: users.avatar,
        roleId: users.roleId,
        isActive: users.isActive,
        roleName: roles.name,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};

/**
 * Check if user has one of the required roles
 * @param  {...string} allowedRoles - Roles that are allowed to access the route
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError("Authentication required"));
    }

    const userRole = req.user.roleName?.toLowerCase();
    const normalizedRoles = allowedRoles.map((r) => r.toLowerCase());

    if (!normalizedRoles.includes(userRole)) {
      return next(
        new AuthorizationError(
          `Access denied. Required role: ${allowedRoles.join(" or ")}`,
        ),
      );
    }

    next();
  };
};

/**
 * Check if user is admin
 */
export const isAdmin = authorize("admin");

/**
 * Check if user owns the resource or is admin
 */
export const isOwnerOrAdmin = (getUserIdFromReq) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError("Authentication required"));
    }

    const resourceUserId = getUserIdFromReq(req);
    const isOwner = req.user.id === parseInt(resourceUserId);
    const isAdminUser = req.user.roleName?.toLowerCase() === "admin";

    if (!isOwner && !isAdminUser) {
      return next(
        new AuthorizationError("You can only access your own resources"),
      );
    }

    next();
  };
};
