/**
 * Palette Service
 * Database-backed CRUD operations for palette workspace with versioning
 */

import { db } from '@/database/client';
import { palettes, paletteVersions } from '@/database/schema';
import { eq, desc, and, ilike, asc, sql } from 'drizzle-orm';
import type {
  ServiceResponse,
  DbPalette,
  CreatePaletteInput,
  UpdatePaletteInput,
  ListPalettesFilters,
  DbPaletteVersion,
} from '@/types/palette';

class PaletteService {
  // ==================== CRUD ====================

  async createPalette(data: CreatePaletteInput): Promise<ServiceResponse<DbPalette>> {
    try {
      const [record] = await db
        .insert(palettes)
        .values({
          name: data.name,
          description: data.description ?? null,
          category: data.category ?? 'project',
          tags: data.tags ?? [],
          favorite: data.favorite ?? false,
          sourceImageName: data.sourceImageName ?? null,
          themeData: data.themeData,
          customColors: data.customColors ?? [],
          pickedLocations: data.pickedLocations ?? [],
        })
        .returning();

      return { success: true, data: record as DbPalette };
    } catch (error) {
      console.error('Create palette error:', error);
      return { success: false, error: 'Failed to create palette', code: 500 };
    }
  }

  async listPalettes(filters: ListPalettesFilters = {}): Promise<ServiceResponse<DbPalette[]>> {
    try {
      const {
        category,
        favorite,
        search,
        sortBy = 'updated',
        limit = 20,
        offset = 0,
      } = filters;

      const conditions = [];
      if (category) {
        conditions.push(eq(palettes.category, category));
      }
      if (favorite !== undefined) {
        conditions.push(eq(palettes.favorite, favorite));
      }
      if (search) {
        conditions.push(ilike(palettes.name, `%${search}%`));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const orderColumn =
        sortBy === 'name'
          ? asc(palettes.name)
          : sortBy === 'created'
            ? desc(palettes.createdAt)
            : desc(palettes.updatedAt);

      const records = await db
        .select()
        .from(palettes)
        .where(whereClause)
        .orderBy(orderColumn)
        .limit(limit)
        .offset(offset);

      return { success: true, data: records as DbPalette[] };
    } catch (error) {
      console.error('List palettes error:', error);
      return { success: false, error: 'Failed to list palettes', code: 500 };
    }
  }

  async getPalette(id: string): Promise<ServiceResponse<DbPalette>> {
    try {
      const [record] = await db.select().from(palettes).where(eq(palettes.id, id)).limit(1);

      if (!record) {
        return { success: false, error: 'Palette not found', code: 404 };
      }

      return { success: true, data: record as DbPalette };
    } catch (error) {
      console.error('Get palette error:', error);
      return { success: false, error: 'Failed to get palette', code: 500 };
    }
  }

  async updatePalette(id: string, data: UpdatePaletteInput): Promise<ServiceResponse<DbPalette>> {
    try {
      // Fetch existing palette
      const existing = await this.getPalette(id);
      if (!existing.success || !existing.data) {
        return existing;
      }

      const prev = existing.data;

      // Check if theme/custom colors/picked locations changed → create version snapshot
      const themeChanged =
        data.themeData && JSON.stringify(data.themeData) !== JSON.stringify(prev.themeData);
      const colorsChanged =
        data.customColors && JSON.stringify(data.customColors) !== JSON.stringify(prev.customColors);
      const locationsChanged =
        data.pickedLocations &&
        JSON.stringify(data.pickedLocations) !== JSON.stringify(prev.pickedLocations);

      if (themeChanged || colorsChanged || locationsChanged) {
        // Snapshot current state before updating
        await db.insert(paletteVersions).values({
          paletteId: id,
          versionNumber: prev.version,
          themeData: prev.themeData,
          customColors: prev.customColors ?? [],
          pickedLocations: prev.pickedLocations ?? [],
          changeNote: data.changeNote ?? `Version ${prev.version}`,
        });
      }

      // Build update payload (only include defined fields)
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.tags !== undefined) updateData.tags = data.tags;
      if (data.favorite !== undefined) updateData.favorite = data.favorite;
      if (data.themeData !== undefined) updateData.themeData = data.themeData;
      if (data.customColors !== undefined) updateData.customColors = data.customColors;
      if (data.pickedLocations !== undefined) updateData.pickedLocations = data.pickedLocations;

      // Increment version only if visual data changed
      if (themeChanged || colorsChanged || locationsChanged) {
        updateData.version = prev.version + 1;
      }

      const [updated] = await db
        .update(palettes)
        .set(updateData)
        .where(eq(palettes.id, id))
        .returning();

      return { success: true, data: updated as DbPalette };
    } catch (error) {
      console.error('Update palette error:', error);
      return { success: false, error: 'Failed to update palette', code: 500 };
    }
  }

  async deletePalette(id: string): Promise<ServiceResponse<{ message: string }>> {
    try {
      const existing = await this.getPalette(id);
      if (!existing.success) {
        return existing as ServiceResponse<{ message: string }>;
      }

      await db.delete(palettes).where(eq(palettes.id, id));

      return { success: true, data: { message: 'Palette deleted' } };
    } catch (error) {
      console.error('Delete palette error:', error);
      return { success: false, error: 'Failed to delete palette', code: 500 };
    }
  }

  // ==================== Favorites ====================

  async toggleFavorite(id: string): Promise<ServiceResponse<DbPalette>> {
    try {
      const existing = await this.getPalette(id);
      if (!existing.success || !existing.data) {
        return existing;
      }

      const [updated] = await db
        .update(palettes)
        .set({ favorite: !existing.data.favorite, updatedAt: new Date() })
        .where(eq(palettes.id, id))
        .returning();

      return { success: true, data: updated as DbPalette };
    } catch (error) {
      console.error('Toggle favorite error:', error);
      return { success: false, error: 'Failed to toggle favorite', code: 500 };
    }
  }

  // ==================== Versioning ====================

  async getVersions(paletteId: string): Promise<ServiceResponse<DbPaletteVersion[]>> {
    try {
      const records = await db
        .select()
        .from(paletteVersions)
        .where(eq(paletteVersions.paletteId, paletteId))
        .orderBy(desc(paletteVersions.versionNumber));

      return { success: true, data: records as DbPaletteVersion[] };
    } catch (error) {
      console.error('Get versions error:', error);
      return { success: false, error: 'Failed to get versions', code: 500 };
    }
  }

  async restoreVersion(
    paletteId: string,
    versionNumber: number
  ): Promise<ServiceResponse<DbPalette>> {
    try {
      // Fetch the version to restore
      const [versionRecord] = await db
        .select()
        .from(paletteVersions)
        .where(
          and(
            eq(paletteVersions.paletteId, paletteId),
            eq(paletteVersions.versionNumber, versionNumber)
          )
        )
        .limit(1);

      if (!versionRecord) {
        return { success: false, error: 'Version not found', code: 404 };
      }

      // Get current palette to snapshot it before restoring
      const current = await this.getPalette(paletteId);
      if (!current.success || !current.data) {
        return current;
      }

      // Snapshot current state
      await db.insert(paletteVersions).values({
        paletteId,
        versionNumber: current.data.version,
        themeData: current.data.themeData,
        customColors: current.data.customColors ?? [],
        pickedLocations: current.data.pickedLocations ?? [],
        changeNote: `Auto-snapshot before restoring v${versionNumber}`,
      });

      // Restore from version
      const [updated] = await db
        .update(palettes)
        .set({
          themeData: versionRecord.themeData,
          customColors: versionRecord.customColors ?? [],
          pickedLocations: versionRecord.pickedLocations ?? [],
          version: current.data.version + 1,
          updatedAt: new Date(),
        })
        .where(eq(palettes.id, paletteId))
        .returning();

      return { success: true, data: updated as DbPalette };
    } catch (error) {
      console.error('Restore version error:', error);
      return { success: false, error: 'Failed to restore version', code: 500 };
    }
  }

  // ==================== Stats ====================

  async getPaletteCount(): Promise<ServiceResponse<{ total: number; favorites: number }>> {
    try {
      const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(palettes);

      const [favResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(palettes)
        .where(eq(palettes.favorite, true));

      return {
        success: true,
        data: {
          total: totalResult?.count ?? 0,
          favorites: favResult?.count ?? 0,
        },
      };
    } catch (error) {
      console.error('Get palette count error:', error);
      return { success: false, error: 'Failed to get count', code: 500 };
    }
  }
}

export const paletteService = new PaletteService();
