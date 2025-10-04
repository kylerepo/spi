import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Types for the new pages (compatible with Supabase)
export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  age: number;
  bio: string;
  location: string;
  gender?: string;
  seekingGender?: string;
  accountType: 'single' | 'couple';
  isVerified: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfilePhoto {
  id: string;
  profileId: string;
  url: string;
  isPrimary: boolean;
  order: number;
  createdAt: string;
}

// Community post schema for IsoPage
export interface InsertCommunityPost {
  title: string;
  content: string;
  category: string;
  isAnonymous: boolean;
}

export const insertCommunityPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(2000),
  category: z.string().min(1),
  isAnonymous: z.boolean(),
});
