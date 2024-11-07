import { z } from "zod";
import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

// Define the Follow schema using Drizzle ORM
export const BlogFollow = pgTable("blog_follows", {
  id: serial("id").primaryKey(), // Assuming you want an auto-incrementing ID
  followerId: varchar("follower_id").references("users.id").notNull(), // Assuming 'users' is the table name for User
  followeeId: varchar("followee_id").references("users.id").notNull(), // Assuming 'users' is the table name for User
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Unique constraint on followerId and followeeId
BlogFollow.index({ followerId: 1, followeeId: 1 }, { unique: true });

// Optional: Define Zod schema for validation (if needed)
export const BlogFollowSchema = z.object({
  followerId: z.string().optional(), // Assuming it's a string representation of ObjectId
  followeeId: z.string().optional(), // Assuming it's a string representation of ObjectId
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
