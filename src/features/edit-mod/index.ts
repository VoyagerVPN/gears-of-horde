/**
 * Edit Mod Feature
 * 
 * Feature for creating and editing mods.
 * 
 * Usage:
 * ```tsx
 * import { ModEditor, useModForm, validateModForm } from '@/features/edit-mod';
 * 
 * function Page() {
 *   return <ModEditor initialData={mod} onSave={handleSave} />;
 * }
 * ```
 */

// UI Components
export { default as ModEditor } from './ui/ModEditor';
export { default as EditorToolbar } from './ui/EditorToolbar';

// Hooks
export { useModForm } from './model/hooks/useModForm';
export { useDraftAutosave, clearModDraft } from './model/hooks/useDraftAutosave';

// Validation
export {
  validateModForm,
  translateFieldPath,
  parseValidationErrors
} from './model/validation';

// API
export { createMod, updateMod } from './api';
export type { CreateModInput, UpdateModInput } from './api';

// Types
export type {
  ModFormData,
  ValidationResult,
  ValidationError,
  DraftData,
  ModEditorProps,
  EditorToolbarProps
} from './model/types';
