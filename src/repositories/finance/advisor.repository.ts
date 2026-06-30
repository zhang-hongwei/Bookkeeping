/**
 * 顾问会话/消息仓库（Phase 6，FR-003）。按 userId 隔离。
 * 消息带 citedFindings（FR-007 锚点）+ degraded + proposalId（串联审批）。
 */
import { and, eq, asc, desc } from 'drizzle-orm';
import {
  advisorSessions,
  advisorMessages,
  type AdvisorSessionItem,
  type AdvisorMessageItem,
  type AdvisorSourceRef,
  type AdvisorRole,
} from '@/database/schema/finance';
import { FinanceRepository } from './base';

export class AdvisorRepository extends FinanceRepository {
  // ===== 会话 =====

  async createSession(title?: string): Promise<AdvisorSessionItem> {
    const [row] = await this.db
      .insert(advisorSessions)
      .values({ userId: this.requireUserId(), title: title ?? null })
      .returning();
    return row!;
  }

  async listSessions(): Promise<AdvisorSessionItem[]> {
    return this.db
      .select()
      .from(advisorSessions)
      .where(eq(advisorSessions.userId, this.requireUserId()))
      .orderBy(desc(advisorSessions.createdAt));
  }

  async findSession(id: string): Promise<AdvisorSessionItem | null> {
    const [row] = await this.db
      .select()
      .from(advisorSessions)
      .where(
        and(
          eq(advisorSessions.id, id),
          eq(advisorSessions.userId, this.requireUserId()),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  // ===== 消息 =====

  async createMessage(input: {
    sessionId: string;
    role: AdvisorRole;
    content: string;
    citedFindings?: AdvisorSourceRef[];
    degraded?: boolean;
    proposalId?: string | null;
  }): Promise<AdvisorMessageItem> {
    const [row] = await this.db
      .insert(advisorMessages)
      .values({
        sessionId: input.sessionId,
        userId: this.requireUserId(),
        role: input.role,
        content: input.content,
        citedFindings: input.citedFindings ?? [],
        degraded: input.degraded ?? false,
        proposalId: input.proposalId ?? null,
      })
      .returning();
    return row!;
  }

  /** 会话历史（按时间升序）。 */
  async listMessages(sessionId: string): Promise<AdvisorMessageItem[]> {
    return this.db
      .select()
      .from(advisorMessages)
      .where(
        and(
          eq(advisorMessages.sessionId, sessionId),
          eq(advisorMessages.userId, this.requireUserId()),
        ),
      )
      .orderBy(asc(advisorMessages.createdAt));
  }
}

export function advisorRepository(userId: string): AdvisorRepository {
  return new AdvisorRepository(userId);
}
