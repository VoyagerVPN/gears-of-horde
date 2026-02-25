/**
 * Tag Entity Types
 * 
 * Business entity representing a categorization tag.
 */

// ============================================================================
// ENUMS
// ============================================================================

export type TagCategory = 
  | 'tag' 
  | 'author' 
  | 'gamever' 
  | 'lang' 
  | 'status' 
  | 'newscat' 
  | 'internal';

export const TAG_CATEGORIES: TagCategory[] = [
  'tag', 'author', 'gamever', 'lang', 'status', 'newscat', 'internal'
];

// ============================================================================
// BASE TYPES
// ============================================================================

export interface TagColor {
  bg: string;
  text: string;
  border: string;
}

// ============================================================================
// MAIN ENTITY
// ============================================================================

export interface Tag {
  id: string;
  value: string;
  displayName: string;
  color?: string | null;
  category: TagCategory;
  usageCount: number;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// DTOs
// ============================================================================

export interface CreateTagDto {
  value: string;
  displayName: string;
  color?: string;
  category: TagCategory;
}

export interface UpdateTagDto extends Partial<CreateTagDto> {
  id: string;
}

// ============================================================================
// VIEW MODELS
// ============================================================================

export interface TagListItem {
  id: string;
  displayName: string;
  color?: string | null;
  category: TagCategory;
  usageCount: number;
}

export interface TagWithUsage extends Tag {
  mods?: Array<{
    id: string;
    title: string;
    slug: string;
  }>;
}
