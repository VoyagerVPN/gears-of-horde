/**
 * Edit Mod Feature Types
 * 
 * Types specific to the mod editing feature.
 * Follows SRP: only editing-related types, not general mod types.
 */

import type { Mod, ModStatus, ModTag } from '@/entities/mod';

// ============================================================================
// FORM TYPES
// ============================================================================

export interface ModFormData {
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
  links: {
    download: string;
    discord: string;
    community: Array<{ name: string; url: string }>;
    donations: Array<{ name: string; url: string }>;
  };
  videos: {
    trailer: string;
    review: string;
  };
  screenshots: string[];
  changelog: Array<{
    version: string;
    date: string;
    changes: string[];
  }>;
  localizations: Array<{
    code: string;
    name: string;
    type: 'builtin' | 'external';
    url?: string;
  }>;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

// ============================================================================
// DRAFT TYPES
// ============================================================================

export interface DraftExtraData {
  tempGameVersionTags?: ModTag[];
}

export interface DraftData<T = unknown> {
  id: string;
  data: T;
  extraData?: DraftExtraData;
  savedAt: string;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface ModEditorProps {
  initialData?: Mod;
  isNew?: boolean;
  submissionId?: string;
  onSave?: (mod: Mod) => void;
  onCancel?: () => void;
}

export interface EditorToolbarProps {
  title: string;
  isNew: boolean;
  isSaving: boolean;
  isAutosaving: boolean;
  lastSavedAt: string | null;
  warningConfirmed: boolean;
  isPreviewMode: boolean;
  onSave: () => void;
  onSaveDraft: () => void;
  onHistoryClick: () => void;
  onPreviewToggle: () => void;
}
