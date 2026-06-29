/**
 * 营养管理API调用
 */

export interface NutritionStats {
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface MealRecord {
  id: string;
  userId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: string[];
  calories: number;
  createdAt: string;
}

/**
 * 获取营养统计
 */
export async function getNutritionStats(
  userId: string,
  dateRange?: { start: string; end: string }
): Promise<NutritionStats> {
  const params = new URLSearchParams({ userId });
  if (dateRange) {
    params.append('start', dateRange.start);
    params.append('end', dateRange.end);
  }

  const response = await fetch(`/api/nutrition-stats?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch nutrition stats');
  }

  const data = await response.json();
  return data.data;
}

/**
 * 获取用餐记录
 */
export async function getMealRecords(
  userId: string,
  options?: { page?: number; limit?: number; date?: string }
): Promise<MealRecord[]> {
  const params = new URLSearchParams({ userId });
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.date) params.append('date', options.date);

  const response = await fetch(`/api/meal-records?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch meal records');
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * 添加用餐记录
 */
export async function addMealRecord(mealData: Omit<MealRecord, 'id' | 'createdAt'>): Promise<MealRecord> {
  const response = await fetch('/api/meal-records', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mealData),
  });

  if (!response.ok) {
    throw new Error('Failed to add meal record');
  }

  const data = await response.json();
  return data.data;
}

/**
 * 更新用餐记录
 */
export async function updateMealRecord(recordId: string, mealData: Partial<MealRecord>): Promise<MealRecord> {
  const response = await fetch(`/api/meal-records/${recordId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mealData),
  });

  if (!response.ok) {
    throw new Error('Failed to update meal record');
  }

  const data = await response.json();
  return data.data;
}

/**
 * 删除用餐记录
 */
export async function deleteMealRecord(recordId: string): Promise<void> {
  const response = await fetch(`/api/meal-records/${recordId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete meal record');
  }
}