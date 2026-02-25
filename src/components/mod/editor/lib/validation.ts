"use client";

import { ModData } from "@/schemas";
import { ValidationResult } from "../types";

export function validateModForm(data: ModData, t: (key: string) => string): ValidationResult {
    const errors: Array<{ field: string; message: string }> = [];
    const warnings: string[] = [];

    // Required field checks
    if (!data.title?.trim()) {
        errors.push({ field: 'title', message: t("validationErrors.Title is required") });
    }

    const authorTags = data.tags.filter(t => t.category === 'author');
    if (!data.author?.trim() && authorTags.length === 0) {
        errors.push({ field: 'author', message: t("validationErrors.Author is required") });
    }

    if (!data.version?.trim()) {
        errors.push({ field: 'version', message: t("validationErrors.Version is required") });
    }

    if (!data.gameVersion?.trim()) {
        errors.push({ field: 'gameVersion', message: t("validationErrors.Game version is required") });
    }

    const descriptionWords = data.description?.trim().split(/\s+/).filter(word => word.length > 0).length || 0;
    if (descriptionWords < 5) {
        errors.push({ field: 'description', message: t("validationErrors.Description must contain at least 5 words") });
    }

    if (!data.bannerUrl?.trim()) {
        errors.push({ field: 'bannerUrl', message: t("validationErrors.Banner is required") });
    }

    const contentTags = data.tags.filter(tag =>
        tag.category !== 'lang' &&
        tag.category !== 'gamever'
    );
    if (contentTags.length === 0) {
        errors.push({ field: 'tags', message: t("validationErrors.At least one tag is required") });
    }

    if (!data.screenshots || data.screenshots.length === 0) {
        errors.push({ field: 'screenshots', message: t("validationErrors.At least one screenshot is required") });
    }

    if (data.status !== 'upcoming' && !data.links.download?.trim()) {
        errors.push({ field: 'links.download', message: t("validationErrors.Download link is required") });
    }

    // Warnings
    if (data.features.length === 0) {
        warnings.push(t('featuresEmptyWarning'));
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

export function translateFieldPath(path: string, _t: (key: string) => string, tCommon: (key: string) => string): string {
    // Handle changelog array paths like "changelog.0.date"
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

export function parseValidationErrors(errorString: string, t: (key: string) => string, tCommon: (key: string) => string): string {
    const errors = errorString.split('\n');
    return errors.map(errorMsg => {
        const colonIdx = errorMsg.indexOf(': ');
        if (colonIdx > 0) {
            const fieldPath = errorMsg.substring(0, colonIdx);
            const message = errorMsg.substring(colonIdx + 2);
            const friendlyPath = translateFieldPath(fieldPath, t, tCommon);
            // Try to translate, fallback to original message if key not found
            let translatedMessage = message;
            try {
                const possibleTranslation = t(`validationErrors.${message}`);
                if (possibleTranslation !== `validationErrors.${message}`) {
                    translatedMessage = possibleTranslation;
                }
            } catch {
                // Keep original message
            }
            return `${friendlyPath}: ${translatedMessage}`;
        }
        return errorMsg;
    }).filter(Boolean).join('\n');
}
