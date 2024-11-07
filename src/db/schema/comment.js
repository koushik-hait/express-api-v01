import { z } from "zod";
import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

// Define the Comment schema using Drizzle ORM
export const Comment = pgTable("comments", {
  id: serial("id").primaryKey(), // Assuming you want an auto-incrementing ID
  content: varchar("content", { length: 500 }).notNull(), // Required field, adjust length as needed
  postId: varchar("post_id").references("blog_posts.id"), // Assuming 'blog_posts' is the table name for BlogPost
  author: varchar("author").references("users.id"), // Assuming 'users' is the table name for User
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Optional: Define Zod schema for validation (if needed)
export const CommentSchema = z.object({
  content: z.string().min(1), // Required field
  postId: z.string().optional(), // Assuming it's a string representation of ObjectId
  author: z.string().optional(), // Assuming it's a string representation of ObjectId
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
