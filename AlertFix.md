# Alert Usage Inventory

This document lists all instances of the default browser `alert()` function found in the codebase. These should eventually be replaced with more modern UI components (like toasts or custom modals).

## 1. Mod Management

### VisualModEditor.tsx
- **Path:** `src/components/mod/VisualModEditor.tsx`
- **Actions:**
  - **Mod Creation Success:** `alert("Mod created successfully!");` (Line 229)
  - **Mod Creation Failure:** `alert(\`Failed to create mod: ${result.error}\`);` (Line 232)
  - **Mod Update Success:** `alert("Mod updated successfully!");` (Line 238)
  - **General Save Error:** `alert("An error occurred while saving.");` (Line 242)

### Profile Mods Page
- **Path:** `src/app/[locale]/profile/mods/page.tsx`
- **Actions:**
  - **Mod Update Failure:** `alert("Failed to update mod");` (Line 74)
  - **Mod Deletion Success:** `alert(t('deleteModSuccess'));` (Line 83)
  - **Mod Deletion Failure:** `alert(t('deleteModError'));` (Line 86)

## 2. Tag Management

### MergeTagModal.tsx
- **Path:** `src/components/tags/MergeTagModal.tsx`
- **Actions:**
  - **Tag Merge Failure:** `alert("Failed to merge tags");` (Line 44)

### Profile Tags Page
- **Path:** `src/app/[locale]/profile/tags/page.tsx`
- **Actions:**
  - **Tag Deletion Failure:** `alert("Failed to delete tag");` (Line 113)
  - **Tag Update Failure:** `alert(\`Failed to update tag: ${result.error}\`);` (Line 131)
  - **Tag Creation Failure:** `alert(\`Failed to create tag: ${result.error}\`);` (Line 137)
  - **Tag Merge Failure:** `alert(\`Failed to merge tags: ${result.error}\`);` (Line 156)

## 3. Mod Features

### SuggestTranslationModal.tsx
- **Path:** `src/components/mod/SuggestTranslationModal.tsx`
- **Actions:**
  - **Translation Submission Success:** `alert(t('successMessage'));` (Line 57)

### EditableChangelog.tsx
- **Path:** `src/components/mod/EditableChangelog.tsx`
- **Actions:**
  - **Validation Error:** `alert(t('mustPickDateBeforeNewVersion'));` (Line 72)
