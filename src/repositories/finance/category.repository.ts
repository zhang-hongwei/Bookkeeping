/**
 * 收支分类数据仓库。
 *
 * - 全部操作按 userId 作用域（FR-013）。
 * - 提供基于关键字的自动归类（导入/自然语言命中即归类）。
 * - 默认分类由 seed 建立（餐饮/购物/…；工资/奖金/…）。
 */
import { and, eq } from 'drizzle-orm';
import {
  categories,
  type CategoryItem,
  type CategoryKind,
} from '@/database/schema/finance';
import { FinanceRepository } from './base';

export interface CreateCategoryInput {
  name: string;
  kind: CategoryKind;
  parentId?: string | null;
  keywords?: string[];
}

export interface UpdateCategoryPatch {
  name?: string;
  keywords?: string[];
  parentId?: string | null;
}

export class CategoryRepository extends FinanceRepository {
  /** 列表，可按 kind 过滤。 */
  async list(kind?: CategoryKind): Promise<CategoryItem[]> {
    const conditions = [eq(categories.userId, this.requireUserId())];
    if (kind) conditions.push(eq(categories.kind, kind));
    return this.db
      .select()
      .from(categories)
      .where(and(...conditions))
      .orderBy(categories.kind, categories.name);
  }

  async findById(id: string): Promise<CategoryItem | null> {
    const [row] = await this.db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.id, id),
          eq(categories.userId, this.requireUserId()),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async create(input: CreateCategoryInput): Promise<CategoryItem> {
    const [row] = await this.db
      .insert(categories)
      .values({
        userId: this.requireUserId(),
        name: input.name,
        kind: input.kind,
        parentId: input.parentId ?? null,
        keywords: input.keywords ?? [],
      })
      .returning();
    if (!row) throw new Error('创建分类失败');
    return row;
  }

  async update(
    id: string,
    patch: UpdateCategoryPatch,
  ): Promise<CategoryItem | null> {
    const [row] = await this.db
      .update(categories)
      .set({ ...patch, updatedAt: new Date() })
      .where(
        and(eq(categories.id, id), eq(categories.userId, this.requireUserId())),
      )
      .returning();
    return row ?? null;
  }

  /**
   * 自动归类：在用户分类中按 keywords 命中匹配，返回首个命中分类。
   * 命中规则：text（小写）包含任一 keyword（小写）。无命中返回 null。
   * 用于导入/自然语言记账的「自动归类」（FR-011）。
   */
  async autoCategorize(
    text: string,
    kind?: CategoryKind,
  ): Promise<CategoryItem | null> {
    const all = await this.list(kind);
    const haystack = text.toLowerCase();
    for (const cat of all) {
      const kws = cat.keywords ?? [];
      if (kws.some((k) => k && haystack.includes(k.toLowerCase()))) {
        return cat;
      }
    }
    return null;
  }
}

/** 工厂：绑定请求 userId 的分类仓库实例。 */
export function categoryRepository(userId: string): CategoryRepository {
  return new CategoryRepository(userId);
}
