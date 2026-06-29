import { pgTable, text, timestamp, integer, decimal, jsonb, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

// 饮食记录表
export const mealRecords = pgTable("meal_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  mealType: varchar("meal_type", { length: 20 }).notNull().default("lunch"), // breakfast, lunch, dinner, snack
  description: text("description"),
  location: text("location"),
  rating: integer("rating").default(0), // 1-5评分
  calories: decimal("calories", { precision: 8, scale: 2 }),
  protein: decimal("protein", { precision: 8, scale: 2 }), // 蛋白质 (g)
  carbs: decimal("carbs", { precision: 8, scale: 2 }), // 碳水化合物 (g)
  fat: decimal("fat", { precision: 8, scale: 2 }), // 脂肪 (g)
  tags: jsonb("tags").$type<string[]>().default([]),
  isPublic: integer("is_public").default(0), // 0: 私密, 1: 公开
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  recordDate: timestamp("record_date").defaultNow().notNull(), // 记录的日期时间
});

// 用户健康目标表 - 已移至 auth.ts，避免重复导出

// 关系定义（暂时注释，因为不使用users表）
// export const mealRecordsRelations = relations(mealRecords, ({ one }) => ({
//   user: one(users, {
//     fields: [mealRecords.userId],
//     references: [users.id],
//   }),
// }));

// export const healthGoalsRelations = relations(healthGoals, ({ one }) => ({
//   user: one(users, {
//     fields: [healthGoals.userId],
//     references: [users.id],
//   }),
// }));