/**
 * 家庭 / 成员数据仓库（Phase 4）。
 *
 * 家庭是多用户聚合，**不继承** `FinanceRepository`（后者绑定单个 userId）。
 * 直接用 `db`，按 familyId / userId 显式作用域。
 *
 * 创建家庭在单个事务内原子写入 family + self 成员 + joint 成员（决策1/5）。
 * 成员退出为软删除（status='left'，决策6）。
 */
import { and, eq, asc, sql } from 'drizzle-orm';
import { db } from '@/database/client';
import {
  financeFamilies,
  financeFamilyMembers,
  type FamilyItem,
  type FamilyMemberItem,
  type FamilyMemberRole,
  type ShareMode,
  type DefaultView,
  type NewFamilyMember,
} from '@/database/schema/finance';

export interface CreateFamilyInput {
  name: string;
  createdByUserId: string;
  defaultCurrency?: string;
}

export interface AddMemberInput {
  familyId: string;
  userId?: string | null;
  displayName: string;
  role: Exclude<FamilyMemberRole, 'self' | 'joint'>;
  shareMode?: ShareMode;
}

export class FamilyRepository {
  /** 创建家庭 + 创建者(self) + 共同(joint) 成员，单事务原子写入。 */
  async createFamilyWithFoundingMembers(
    input: CreateFamilyInput,
  ): Promise<{
    family: FamilyItem;
    selfMember: FamilyMemberItem;
    jointMember: FamilyMemberItem;
  }> {
    return db.transaction(async (tx) => {
      const [family] = await tx
        .insert(financeFamilies)
        .values({
          name: input.name,
          createdByUserId: input.createdByUserId,
          defaultCurrency: input.defaultCurrency ?? 'CNY',
        })
        .returning();
      const [selfMember] = await tx
        .insert(financeFamilyMembers)
        .values({
          familyId: family!.id,
          userId: input.createdByUserId,
          displayName: '我',
          role: 'self',
        })
        .returning();
      const [jointMember] = await tx
        .insert(financeFamilyMembers)
        .values({
          familyId: family!.id,
          userId: null,
          displayName: '家庭·共同',
          role: 'joint',
        })
        .returning();
      return { family: family!, selfMember: selfMember!, jointMember: jointMember! };
    });
  }

  async findFamilyById(id: string): Promise<FamilyItem | null> {
    const [row] = await db
      .select()
      .from(financeFamilies)
      .where(eq(financeFamilies.id, id))
      .limit(1);
    return row ?? null;
  }

  /** 用户在该家庭的 active 成员关系（鉴权用）；无则 null。 */
  async findActiveMember(
    familyId: string,
    userId: string,
  ): Promise<FamilyMemberItem | null> {
    const [row] = await db
      .select()
      .from(financeFamilyMembers)
      .where(
        and(
          eq(financeFamilyMembers.familyId, familyId),
          eq(financeFamilyMembers.userId, userId),
          eq(financeFamilyMembers.status, 'active'),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async findMemberById(memberId: string): Promise<FamilyMemberItem | null> {
    const [row] = await db
      .select()
      .from(financeFamilyMembers)
      .where(eq(financeFamilyMembers.id, memberId))
      .limit(1);
    return row ?? null;
  }

  /** 家庭全部成员（默认仅 active；includeLeft=true 含已退出）。 */
  async listMembers(
    familyId: string,
    { includeLeft = false }: { includeLeft?: boolean } = {},
  ): Promise<FamilyMemberItem[]> {
    const conditions = [eq(financeFamilyMembers.familyId, familyId)];
    if (!includeLeft) conditions.push(eq(financeFamilyMembers.status, 'active'));
    return db
      .select()
      .from(financeFamilyMembers)
      .where(conditions.length === 1 ? conditions[0] : and(...conditions))
      .orderBy(asc(financeFamilyMembers.joinedAt));
  }

  /** 家庭 active 成员（含 joint，用于净资产聚合与画像）。 */
  async listActiveMembers(familyId: string): Promise<FamilyMemberItem[]> {
    return this.listMembers(familyId);
  }

  /** 用户的所有 active 家庭（本阶段通常 ≤1）。 */
  async findFamiliesByUser(userId: string): Promise<FamilyItem[]> {
    const rows = await db
      .select({ family: financeFamilies })
      .from(financeFamilies)
      .innerJoin(
        financeFamilyMembers,
        eq(financeFamilyMembers.familyId, financeFamilies.id),
      )
      .where(
        and(
          eq(financeFamilyMembers.userId, userId),
          eq(financeFamilyMembers.status, 'active'),
        ),
      );
    return rows.map((r) => r.family);
  }

  /** 用户是否已在某 active 家庭（一人一家庭 active，本阶段约束）。 */
  async findActiveFamilyOfUser(
    userId: string,
  ): Promise<FamilyItem | null> {
    const [row] = await db
      .select({ family: financeFamilies })
      .from(financeFamilies)
      .innerJoin(
        financeFamilyMembers,
        eq(financeFamilyMembers.familyId, financeFamilies.id),
      )
      .where(
        and(
          eq(financeFamilyMembers.userId, userId),
          eq(financeFamilyMembers.status, 'active'),
          eq(financeFamilyMembers.role, 'self'),
        ),
      )
      .limit(1);
    return row?.family ?? null;
  }

  async addMember(input: AddMemberInput): Promise<FamilyMemberItem> {
    const values: NewFamilyMember = {
      familyId: input.familyId,
      userId: input.userId ?? null,
      displayName: input.displayName,
      role: input.role,
      shareMode: input.shareMode ?? 'shared',
    };
    const [row] = await db
      .insert(financeFamilyMembers)
      .values(values)
      .returning();
    return row!;
  }

  async updateFamily(
    familyId: string,
    patch: Partial<Pick<FamilyItem, 'name'>>,
  ): Promise<FamilyItem | null> {
    const [row] = await db
      .update(financeFamilies)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(financeFamilies.id, familyId))
      .returning();
    return row ?? null;
  }

  async updateMember(
    memberId: string,
    patch: Partial<{
      displayName: string;
      role: FamilyMemberRole;
      shareMode: ShareMode;
      defaultView: DefaultView;
    }>,
  ): Promise<FamilyMemberItem | null> {
    const [row] = await db
      .update(financeFamilyMembers)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(financeFamilyMembers.id, memberId))
      .returning();
    return row ?? null;
  }

  /** 软退出：status→left、leftAt=now。joint 行不得退出（由 service 校验）。 */
  async softLeaveMember(memberId: string): Promise<FamilyMemberItem | null> {
    const [row] = await db
      .update(financeFamilyMembers)
      .set({ status: 'left', leftAt: new Date(), updatedAt: new Date() })
      .where(eq(financeFamilyMembers.id, memberId))
      .returning();
    return row ?? null;
  }

  /** 家庭 active 成员数（不含 joint；用于 DTO memberCount）。 */
  async countHumanActiveMembers(familyId: string): Promise<number> {
    const [row] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(financeFamilyMembers)
      .where(
        and(
          eq(financeFamilyMembers.familyId, familyId),
          eq(financeFamilyMembers.status, 'active'),
          // 排除 joint（系统共同锚）与 self 之外都算；memberCount 含 self
          sql`role <> 'joint'`,
        ),
      );
    return row?.n ?? 0;
  }
}

export const familyRepository = new FamilyRepository();
