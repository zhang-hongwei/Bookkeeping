import { db } from '@/database/client';
import { githubSettings } from '@/database/schema/github';
import { sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import type { ServiceResponse } from '@/types/palette';
import type { GithubSettingsItem } from '@/database/schema/github';

type SettingsRow = GithubSettingsItem;

interface MaskedSettings {
  configured: boolean;
  validatedUsername: string | null;
  validatedAt: string | null;
  tokenPreview: string | null;
}

class GithubSettingsService {
  private async ensureTable() {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "github_settings" (
        "id" text PRIMARY KEY DEFAULT 'global',
        "github_token" text NOT NULL,
        "validated_at" timestamp,
        "validated_username" text,
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);
  }

  private maskToken(token: string): string {
    if (token.length <= 8) return '****';
    return `${token.slice(0, 4)}****${token.slice(-4)}`;
  }

  async getSettings(): Promise<ServiceResponse<MaskedSettings>> {
    try {
      await this.ensureTable();
      const rows = await db.select().from(githubSettings).limit(1);

      if (rows[0]) {
        const row = rows[0];
        return {
          success: true,
          data: {
            configured: true,
            validatedUsername: row.validatedUsername,
            validatedAt: row.validatedAt?.toISOString() ?? null,
            tokenPreview: this.maskToken(row.githubToken),
          },
        };
      }

      return {
        success: true,
        data: {
          configured: false,
          validatedUsername: null,
          validatedAt: null,
          tokenPreview: null,
        },
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { success: false, error: msg, code: 500 };
    }
  }

  async saveSettings(
    githubToken: string,
  ): Promise<ServiceResponse<MaskedSettings>> {
    try {
      await this.ensureTable();

      // Validate token via GitHub API
      const res = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return {
            success: false,
            error: 'Invalid GitHub token: authentication failed',
            code: 400,
          };
        }
        return {
          success: false,
          error: `GitHub validation failed: ${res.status} ${res.statusText}`,
          code: 400,
        };
      }

      const userData = (await res.json()) as { login: string };
      const now = new Date();

      const [row] = await db
        .insert(githubSettings)
        .values({
          id: 'global',
          githubToken,
          validatedAt: now,
          validatedUsername: userData.login,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: githubSettings.id,
          set: {
            githubToken,
            validatedAt: now,
            validatedUsername: userData.login,
            updatedAt: now,
          },
        })
        .returning();

      return {
        success: true,
        data: {
          configured: true,
          validatedUsername: row.validatedUsername,
          validatedAt: row.validatedAt?.toISOString() ?? null,
          tokenPreview: this.maskToken(row.githubToken),
        },
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { success: false, error: msg, code: 500 };
    }
  }

  async deleteSettings(): Promise<
    ServiceResponse<{ deleted: boolean }>
  > {
    try {
      await this.ensureTable();
      await db.delete(githubSettings).where(eq(githubSettings.id, 'global'));
      return { success: true, data: { deleted: true } };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { success: false, error: msg, code: 500 };
    }
  }

  async getToken(): Promise<string | null> {
    try {
      await this.ensureTable();
      const rows = await db.select().from(githubSettings).limit(1);
      return rows[0]?.githubToken ?? null;
    } catch {
      return null;
    }
  }
}

export const githubSettingsService = new GithubSettingsService();
