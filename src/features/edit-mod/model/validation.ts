/**
 * Mod Form Validation
 * 
 * Pure validation logic following SRP.
 * No UI dependencies, no side effects.
 */

import type { ModFormData, ValidationResult, ValidationError } from './types';

interface TranslationFn {
  (key: string): string;
}

/**
 * Validate mod form data
 * Returns validation result with errors and warnings
 */
export function validateModForm(data: ModFormData, t: TranslationFn): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!data.title?.trim()) {
    errors.push({ field: 'title', message: t('validationErrors.titleRequired') });
  }

  const authorTags = data.tags.filter(t => t.category === 'author');
  if (!data.author?.trim() && authorTags.length === 0) {
    errors.push({ field: 'author', message: t('validationErrors.authorRequired') });
  }

  if (!data.version?.trim()) {
    errors.push({ field: 'version', message: t('validationErrors.versionRequired') });
  }

  if (!data.gameVersion?.trim()) {
    errors.push({ field: 'gameVersion', message: t('validationErrors.gameVersionRequired') });
  }

  // Description word count
  const descriptionWords = data.description?.trim().split(/\s+/).filter(word => word.length > 0).length || 0;
  if (descriptionWords < 5) {
    errors.push({ field: 'description', message: t('validationErrors.descriptionTooShort') });
  }

  if (!data.bannerUrl?.trim()) {
    errors.push({ field: 'bannerUrl', message: t('validationErrors.bannerRequired') });
  }

  // Tags validation (at least one content tag)
  const contentTags = data.tags.filter(tag =>
    tag.category !== 'lang' && tag.category !== 'gamever'
  );
  if (contentTags.length === 0) {
    errors.push({ field: 'tags', message: t('validationErrors.tagsRequired') });
  }

  if (!data.screenshots || data.screenshots.length === 0) {
    errors.push({ field: 'screenshots', message: t('validationErrors.screenshotsRequired') });
  }

  if (data.status !== 'upcoming' && !data.links.download?.trim()) {
    errors.push({ field: 'links.download', message: t('validationErrors.downloadRequired') });
  }

  // Warnings (non-blocking)
  if (data.features.length === 0) {
    warnings.push(t('warnings.featuresEmpty'));
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Translate field path to human-readable name
 * Example: "changelog.0.date" → "Changelog #1 → Date"
 */
export function translateFieldPath(
  path: string,
  _t: TranslationFn,
  tCommon: TranslationFn
): string {
  // Handle changelog array paths
  const changelogMatch = path.match(/^changelog\.(\d+)\.(\w+)$/);
  if (changelogMatch) {
    const idx = parseInt(changelogMatch[1]) + 1;
    const field = changelogMatch[2];
    const fieldName = field === 'date' ? tCommon('releaseDate') : field;
    return `${tCommon('changelog')} #${idx} → ${fieldName}`;
  }

  // Simple field name translations
  const fieldMap: Record<string, string> = {
    'author': tCommon('authorName'),
    'title': tCommon('modTitle'),
    'slug': tCommon('modName'),
    'version': tCommon('version'),
    'gameVersion': tCommon('gameVersion'),
    'description': tCommon('description'),
    'bannerUrl': tCommon('bannerUrl'),
    'tags': tCommon('tags'),
    'screenshots': tCommon('screenshots'),
  };

  return fieldMap[path] || path;
}

/**
 * Parse validation errors from API response
 * Formats error strings with translated field names
 */
export function parseValidationErrors(
  errorString: string,
  t: TranslationFn,
  tCommon: TranslationFn
): string {
  const errors = errorString.split('\n');
  
  return errors.map(errorMsg => {
    const colonIdx = errorMsg.indexOf(': ');
    if (colonIdx > 0) {
      const fieldPath = errorMsg.substring(0, colonIdx);
      const message = errorMsg.substring(colonIdx + 2);
      const friendlyPath = translateFieldPath(fieldPath, t, tCommon);
      
      // Try to translate the message
      let translatedMessage = message;
      try {
        const possibleTranslation = t(`validationErrors.${message}`);
        if (possibleTranslation !== `validationErrors.${message}`) {
          translatedMessage = possibleTranslation;
        }
      } catch {
        // Keep original message if translation fails
      }
      
      return `${friendlyPath}: ${translatedMessage}`;
    }
    return errorMsg;
  }).filter(Boolean).join('\n');
}
