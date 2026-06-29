import { pgTable, text, timestamp, integer, jsonb, uuid, varchar, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { DesignTokenTheme } from '@/types/ai';
import type { DbCustomColor, DbPickedLocation } from '@/types/palette';

/**
 * Palette Workspace Schema
 * Stores design color palettes with versioning support
 */

// ==================== Palettes Table ====================

export const palettes = pgTable('palettes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 20 }).notNull().default('project'),
  tags: jsonb('tags').$type<string[]>().default([]),
  favorite: boolean('favorite').default(false),
  sourceImageName: text('source_image_name'),
  themeData: jsonb('theme_data').$type<DesignTokenTheme>().notNull(),
  customColors: jsonb('custom_colors').$type<DbCustomColor[]>().default([]),
  pickedLocations: jsonb('picked_locations').$type<DbPickedLocation[]>().default([]),
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==================== Palette Versions Table ====================

export const paletteVersions = pgTable('palette_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  paletteId: uuid('palette_id')
    .references(() => palettes.id, { onDelete: 'cascade' })
    .notNull(),
  versionNumber: integer('version_number').notNull(),
  themeData: jsonb('theme_data').$type<DesignTokenTheme>().notNull(),
  customColors: jsonb('custom_colors').$type<DbCustomColor[]>().default([]),
  pickedLocations: jsonb('picked_locations').$type<DbPickedLocation[]>().default([]),
  changeNote: text('change_note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==================== Relations ====================

export const paletteVersionsRelations = relations(paletteVersions, ({ one }) => ({
  palette: one(palettes, {
    fields: [paletteVersions.paletteId],
    references: [palettes.id],
  }),
}));
