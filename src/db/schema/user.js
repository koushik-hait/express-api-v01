import {
  boolean,
  date,
  json,
  pgTable,
  serial,
  varchar,
} from "drizzle-orm/pg-core";

// Define available user roles and login types
const AvailableUserRoles = ["user", "admin"];
const AvailableSocialLogins = ["email_password", "google", "facebook"]; // Add more as needed

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    avatar: json("avatar").default({
      url: "https://via.placeholder.com/200x200.png",
      localPath: "",
    }),
    username: varchar("username", { length: 50 }).notNull().unique(),
    email: varchar("email", { length: 100 }).notNull().unique(),
    role: varchar("role", { length: 10 }).notNull().default("user"),
    password: varchar("password", { length: 255 }).notNull(),
    loginType: varchar("login_type", { length: 20 }).default("email_password"),
    isEmailVerified: boolean("is_email_verified").default(false),
    refreshToken: varchar("refresh_token", { length: 255 }).default(null),
    forgotPasswordToken: varchar("forgot_password_token", {
      length: 255,
    }).default(null),
    forgotPasswordExpiry: date("forgot_password_expiry").default(null),
    emailVerificationToken: varchar("email_verification_token", {
      length: 255,
    }).default(null),
    emailVerificationExpiry: date("email_verification_expiry").default(null),
  },
  { timestamps: true }
);
