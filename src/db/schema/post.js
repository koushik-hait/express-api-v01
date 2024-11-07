import { z } from "zod";
import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  date,
  jsonb,
  timestamp,
  enumType,
} from "drizzle-orm/pg-core";

// Define the BlogPost schema using Drizzle ORM
export const BlogPost = pgTable("blog_posts", {
  id: serial("id").primaryKey(), // Assuming you want an auto-incrementing ID
  title: varchar("title", { length: 200 }).notNull(), // Required field
  description: text("description").notNull(), // Required field
  content: text("content").notNull(), // Required field
  coverImage: varchar("cover_image", { length: 255 }).default(
    "https://via.placeholder.com/300x200.png"
  ),
  author: varchar("author").references("users.id"), // Assuming 'users' is the table name for User
  tags: jsonb("tags").default([]), // Using JSONB for an array of strings
  category: varchar("category").references("categories.id"), // Assuming 'categories' is the table name for Category
  deleted: boolean("deleted").default(false),
  status: enumType("status", ["DRAFT", "PUBLISHED"]).default("DRAFT"), // Enum for status
  publishedAt: date("published_at").nullable(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Optional: Define Zod schema for validation (if needed)
export const BlogPostSchema = z.object({
  title: z.string().max(200).min(3), // Adjust validations as per your needs
  description: z.string().min(1),
  content: z.string().min(3).max(5000),
  coverImage: z
    .string()
    .url()
    .default("https://via.placeholder.com/300x200.png"),
  author: z.string().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  deleted: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  publishedAt: z.date().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
