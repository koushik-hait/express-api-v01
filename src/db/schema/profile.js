import { z } from "zod";
import {
  pgTable,
  serial,
  varchar,
  timestamp,
  date,
  text,
  jsonb,
} from "drizzle-orm/pg-core";

// Define the UserProfile schema using Drizzle ORM
export const UserProfile = pgTable("user_profiles", {
  id: serial("id").primaryKey(), // Assuming you want an auto-incrementing ID
  coverImage: jsonb("cover_image").default({
    url: "https://via.placeholder.com/1080x350",
    localPath: "",
  }),
  firstName: varchar("first_name", { length: 255 }).default("John"),
  lastName: varchar("last_name", { length: 255 }).default("Doe"),
  bio: text("bio").default(""),
  dob: date("dob").nullable(),
  address: text("address").default(""),
  city: varchar("city", { length: 255 }).default(""),
  state: varchar("state", { length: 255 }).default(""),
  country: varchar("country", { length: 255 }).default(""),
  countryCode: varchar("country_code", { length: 10 }).default(""),
  phoneNumber: varchar("phone_number", { length: 20 }).default(""),
  owner: varchar("owner").references("users.id"), // Assuming 'users' is the table name for User
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Optional: Define Zod schema for validation (if needed)
export const UserProfileSchema = z.object({
  coverImage: z.object({
    url: z.string().url().default("https://via.placeholder.com/1080x350"),
    localPath: z.string().default(""),
  }),
  firstName: z.string().default("John"),
  lastName: z.string().default("Doe"),
  bio: z.string().default(""),
  dob: z.date().nullable(),
  address: z.string().default(""),
  city: z.string().default(""),
  state: z.string().default(""),
  country: z.string().default(""),
  countryCode: z.string().default(""),
  phoneNumber: z.string().default(""),
  owner: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
