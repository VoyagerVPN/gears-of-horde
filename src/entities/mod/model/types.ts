/**
 * Mod Entity Types
 * 
 * Business entity representing a game modification.
 * This is the single source of truth for mod-related types.
 */


// ============================================================================
// ENUMS
// ============================================================================

export type ModStatus = 'active' | 'on_hold' | 'discontinued' | 'upcoming' | 'unknown';

export const MOD_STATUS_LIST: ModStatus[] = [
  'active', 'on_hold', 'discontinued', 'upcoming', 'unknown'
];

// ============================================================================
// BASE TYPES
// ============================================================================

export interface ModLink {
  name: string;
  url: string;
}

export interface ModLinks {
  download: string;
  discord: string;
  community: ModLink[];
  donations: ModLink[];
}

export interface ModVideos {
  trailer: string;
  review: string;
}

export interface ModChangelog {
  version: string;
  date: string;
  changes: string[];
  isSaveBreaking?: boolean;
}

export interface ModLocalization {
  code: string;
  name: string;
  type: 'builtin' | 'external';
  url?: string;
}

export interface ModStats {
  rating: number;
  ratingCount: number;
  downloads: string;
  views: string;
}

// ============================================================================
// MAIN ENTITY
// ============================================================================

export interface Mod {
  id?: string;
  title: string;
  slug: string;
  version: string;
  author: string;
  description: string;
  status: ModStatus;
  gameVersion: string;
  bannerUrl: string;
  isSaveBreaking: boolean;
  features: string[];
  tags: ModTag[];
  installationSteps: string[];
  links: ModLinks;
  stats: ModStats;
  videos: ModVideos;
  screenshots: string[];
  changelog: ModChangelog[];
  localizations: ModLocalization[];
  createdAt?: string;
  updatedAt?: string;
}

// Tag within mod context
export interface ModTag {
  id?: string;
  value?: string;
  displayName: string;
  color?: string | null;
  category?: string;
  usageCount?: number;
  isExternal?: boolean;
  externalLink?: string;
}

// ============================================================================
// DTOs
// ============================================================================

export interface CreateModDto {
  title: string;
  slug: string;
  version: string;
  author: string;
  description: string;
  status: ModStatus;
  gameVersion: string;
  bannerUrl: string;
  features?: string[];
  tags?: ModTag[];
  installationSteps?: string[];
  links?: Partial<ModLinks>;
  videos?: Partial<ModVideos>;
  screenshots?: string[];
  changelog?: ModChangelog[];
  localizations?: ModLocalization[];
}

export interface UpdateModDto extends Partial<CreateModDto> {
  id: string;
}

// ============================================================================
// VIEW MODELS
// ============================================================================

export interface ModListItem {
  id: string;
  title: string;
  slug: string;
  version: string;
  author: string;
  description: string;
  status: ModStatus;
  bannerUrl?: string;
  tags: ModTag[];
  stats: ModStats;
  updatedAt: string;
}

export interface ModDetail extends Mod {
  isSubscribed?: boolean;
  userRating?: number;
}
