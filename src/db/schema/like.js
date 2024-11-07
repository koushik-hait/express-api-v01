import { z } from "zod";
import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";

// Define the Like schema using Drizzle ORM
export const BlogLike = pgTable("blog_likes", {
  id: serial("id").primaryKey(), // Assuming you want an auto-incrementing ID
  postId: varchar("post_id").references("blog_posts.id").default(null), // Assuming 'blog_posts' is the table name for BlogPost
  commentId: varchar("comment_id").references("blog_comments.id").default(null), // Assuming 'blog_comments' is the table name for BlogComment
  likedBy: varchar("liked_by").references("users.id").notNull(), // Assuming 'users' is the table name for User
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Unique constraint on postId and likedBy
BlogLike.index({ postId: 1, likedBy: 1 }, { unique: true });

// Optional: Define Zod schema for validation (if needed)
export const BlogLikeSchema = z.object({
  postId: z.string().nullable(), // Assuming it's a string representation of ObjectId
  commentId: z.string().nullable(), // Assuming it's a string representation of ObjectId
  likedBy: z.string(), // Required field
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
