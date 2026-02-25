/**
 * Mod Entity Mappers
 * 
 * Convert between different mod representations:
 * - Database (DB) → Domain (Mod)
 * - Domain (Mod) → API (DTO)
 * - Domain (Mod) → View (ViewModel)
 */

import type { Mod, ModListItem, ModDetail, ModTag } from './types';
import type { ModData } from '@/schemas';

// ============================================================================
// SCHEMA MAPPERS
// ============================================================================

/**
 * Convert schema ModData to domain Mod
 */
export function fromSchema(data: ModData): Mod {
  return {
    ...data,
    tags: data.tags.map(fromSchemaTag),
  };
}

/**
 * Convert domain Mod to schema ModData
 */
export function toSchema(mod: Mod): ModData {
  return {
    ...mod,
    tags: mod.tags.map(toSchemaTag),
  } as ModData;
}

function fromSchemaTag(tag: ModData['tags'][number]): ModTag {
  return {
    id: tag.id,
    value: tag.value,
    displayName: tag.displayName,
    color: tag.color,
    category: tag.category,
    usageCount: tag.usageCount,
    isExternal: tag.isExternal,
    externalLink: tag.externalLink,
  };
}

function toSchemaTag(tag: ModTag): ModData['tags'][number] {
  return {
    id: tag.id,
    value: tag.value,
    displayName: tag.displayName,
    color: tag.color,
    category: tag.category,
    usageCount: tag.usageCount,
    isExternal: tag.isExternal,
    externalLink: tag.externalLink,
  };
}

// ============================================================================
// VIEW MODEL MAPPERS
// ============================================================================

/**
 * Convert domain Mod to list item view model
 */
export function toListItem(mod: Mod): ModListItem {
  return {
    id: mod.id || mod.slug,
    title: mod.title,
    slug: mod.slug,
    version: mod.version,
    author: mod.author,
    description: mod.description,
    status: mod.status,
    bannerUrl: mod.bannerUrl,
    tags: mod.tags,
    stats: mod.stats,
    updatedAt: mod.updatedAt || mod.createdAt || new Date().toISOString(),
  };
}

/**
 * Convert domain Mod to detail view model
 */
export function toDetail(
  mod: Mod,
  extras?: { isSubscribed?: boolean; userRating?: number }
): ModDetail {
  return {
    ...mod,
    isSubscribed: extras?.isSubscribed ?? false,
    userRating: extras?.userRating,
  };
}
