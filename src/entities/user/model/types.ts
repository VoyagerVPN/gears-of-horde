/**
 * User Entity Types
 * 
 * Business entity representing a platform user.
 */

// ============================================================================
// ENUMS
// ============================================================================

export type UserRole = 'USER' | 'MODERATOR' | 'DEVELOPER' | 'ADMIN';

export const USER_ROLES: UserRole[] = ['USER', 'MODERATOR', 'DEVELOPER', 'ADMIN'];

// ============================================================================
// BASE TYPES
// ============================================================================

export interface UserStats {
  modsCreated: number;
  modsDownloaded: number;
  commentsPosted: number;
  reviewsPosted: number;
}

// ============================================================================
// MAIN ENTITY
// ============================================================================

export interface User {
  id: string;
  discordId: string;
  username: string;
  avatarUrl?: string;
  role: UserRole;
  bio?: string;
  stats: UserStats;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// DTOs
// ============================================================================

export interface UpdateUserDto {
  id: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
}

// ============================================================================
// VIEW MODELS
// ============================================================================

export interface UserProfile extends User {
  badges?: Array<{
    id: string;
    name: string;
    icon: string;
    earnedAt: string;
  }>;
  recentActivity?: Array<{
    type: 'download' | 'comment' | 'review' | 'create';
    modId: string;
    modTitle: string;
    modSlug: string;
    date: string;
  }>;
}
