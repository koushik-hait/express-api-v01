import { pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { z } from "zod";

// Define the Bookmark schema using Drizzle ORM
export const BlogBookmark = pgTable("blog_bookmarks", {
  id: serial("id").primaryKey(), // Assuming you want an auto-incrementing ID
  postId: varchar("post_id").references("blog_posts.id").notNull(), // Assuming 'blog_posts' is the table name for BlogPost
  bookmarkedBy: varchar("bookmarked_by").references("users.id").notNull(), // Assuming 'users' is the table name for User
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Unique constraint on postId and bookmarkedBy
BlogBookmark.index({ postId: 1, bookmarkedBy: 1 }, { unique: true });

// Optional: Define Zod schema for validation (if needed)
export const BlogBookmarkSchema = z.object({
  postId: z.string().optional(), // Assuming it's a string representation of ObjectId
  bookmarkedBy: z.string().optional(), // Assuming it's a string representation of ObjectId
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
