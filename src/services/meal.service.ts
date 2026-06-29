import { db } from '@/database/client';
import { mealRecords, healthGoals } from '@/database/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

export interface CreateMealRecordData {
  userId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  mealType: string;
  description?: string;
  location?: string;
  rating?: number;
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
  tags?: string[];
  isPublic?: number;
  recordDate?: Date;
}

export interface HealthGoalData {
  userId: string;
  goalType: string;
  dailyCalories: string;
  dailyProtein: string;
  dailyCarbs: string;
  dailyFat: string;
}

class MealService {
  async createMealRecord(data: CreateMealRecordData): Promise<ServiceResponse> {
    try {
      const [record] = await db.insert(mealRecords).values(data).returning();

      return {
        success: true,
        data: record,
      };
    } catch (error) {
      console.error('Create meal record error:', error);
      return {
        success: false,
        error: '创建饮食记录失败',
        code: 500,
      };
    }
  }

  async getUserMealRecords(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<ServiceResponse> {
    try {
      const records = await db
        .select()
        .from(mealRecords)
        .where(eq(mealRecords.userId, userId))
        .orderBy(desc(mealRecords.recordDate))
        .limit(limit)
        .offset(offset);

      return {
        success: true,
        data: records,
      };
    } catch (error) {
      console.error('Get user meal records error:', error);
      return {
        success: false,
        error: '获取饮食记录失败',
        code: 500,
      };
    }
  }

  async getMealRecordsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ServiceResponse> {
    try {
      const records = await db
        .select()
        .from(mealRecords)
        .where(
          and(
            eq(mealRecords.userId, userId),
            gte(mealRecords.recordDate, startDate),
            lte(mealRecords.recordDate, endDate)
          )
        )
        .orderBy(desc(mealRecords.recordDate));

      return {
        success: true,
        data: records,
      };
    } catch (error) {
      console.error('Get meal records by date range error:', error);
      return {
        success: false,
        error: '获取日期范围内的饮食记录失败',
        code: 500,
      };
    }
  }

  async getMealRecordById(id: string): Promise<ServiceResponse> {
    try {
      const [record] = await db
        .select()
        .from(mealRecords)
        .where(eq(mealRecords.id, id))
        .limit(1);

      if (!record) {
        return {
          success: false,
          error: '饮食记录不存在',
          code: 404,
        };
      }

      return {
        success: true,
        data: record,
      };
    } catch (error) {
      console.error('Get meal record error:', error);
      return {
        success: false,
        error: '获取饮食记录失败',
        code: 500,
      };
    }
  }

  async updateMealRecord(
    id: string,
    data: Partial<{
      description: string;
      location: string;
      rating: number;
      calories: string;
      protein: string;
      carbs: string;
      fat: string;
      tags: string[];
      isPublic: number;
    }>
  ): Promise<ServiceResponse> {
    try {
      // 检查记录是否存在
      const existingRecord = await this.getMealRecordById(id);
      if (!existingRecord.success) {
        return existingRecord;
      }

      const [record] = await db
        .update(mealRecords)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(mealRecords.id, id))
        .returning();

      return {
        success: true,
        data: record,
      };
    } catch (error) {
      console.error('Update meal record error:', error);
      return {
        success: false,
        error: '更新饮食记录失败',
        code: 500,
      };
    }
  }

  async deleteMealRecord(id: string): Promise<ServiceResponse> {
    try {
      // 检查记录是否存在
      const existingRecord = await this.getMealRecordById(id);
      if (!existingRecord.success) {
        return existingRecord;
      }

      await db.delete(mealRecords).where(eq(mealRecords.id, id));

      return {
        success: true,
        data: { message: '饮食记录已删除' },
      };
    } catch (error) {
      console.error('Delete meal record error:', error);
      return {
        success: false,
        error: '删除饮食记录失败',
        code: 500,
      };
    }
  }

  async getDailyNutritionStats(userId: string, date: Date): Promise<ServiceResponse> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const result = await db
        .select({
          totalCalories: sql<string>`COALESCE(SUM(${mealRecords.calories}), 0)`,
          totalProtein: sql<string>`COALESCE(SUM(${mealRecords.protein}), 0)`,
          totalCarbs: sql<string>`COALESCE(SUM(${mealRecords.carbs}), 0)`,
          totalFat: sql<string>`COALESCE(SUM(${mealRecords.fat}), 0)`,
          mealCount: sql<number>`COUNT(*)`,
        })
        .from(mealRecords)
        .where(
          and(
            eq(mealRecords.userId, userId),
            gte(mealRecords.recordDate, startOfDay),
            lte(mealRecords.recordDate, endOfDay)
          )
        );

      return {
        success: true,
        data: result[0],
      };
    } catch (error) {
      console.error('Get daily nutrition stats error:', error);
      return {
        success: false,
        error: '获取每日营养统计失败',
        code: 500,
      };
    }
  }

  async createOrUpdateHealthGoal(data: HealthGoalData): Promise<ServiceResponse> {
    try {
      const existing = await db
        .select()
        .from(healthGoals)
        .where(eq(healthGoals.user_id, data.userId))
        .limit(1);

      let goal;
      if (existing.length > 0) {
        [goal] = await db
          .update(healthGoals)
          .set({
            ...data,
            updatedAt: new Date(),
          })
          .where(eq(healthGoals.user_id, data.userId))
          .returning();
      } else {
        [goal] = await db.insert(healthGoals).values(data).returning();
      }

      return {
        success: true,
        data: goal,
      };
    } catch (error) {
      console.error('Create or update health goal error:', error);
      return {
        success: false,
        error: '创建或更新健康目标失败',
        code: 500,
      };
    }
  }

  async getUserHealthGoal(userId: string): Promise<ServiceResponse> {
    try {
      const [goal] = await db
        .select()
        .from(healthGoals)
        .where(eq(healthGoals.user_id, userId))
        .limit(1);

      if (!goal) {
        return {
          success: false,
          error: '健康目标不存在',
          code: 404,
        };
      }

      return {
        success: true,
        data: goal,
      };
    } catch (error) {
      console.error('Get user health goal error:', error);
      return {
        success: false,
        error: '获取健康目标失败',
        code: 500,
      };
    }
  }
}

export const mealService = new MealService();