/**
 * React Hook Form Utilities
 * 
 * Pre-configured hooks with Zod validation for common forms.
 * Uses react-hook-form with @hookform/resolvers/zod.
 * 
 * Usage:
 *   import { useModForm } from '@/hooks/useFormValidation';
 *   const { register, handleSubmit, formState: { errors } } = useModForm();
 */

import { useForm, FieldValues, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    ModDataSchema,
    TagCreateSchema,
    UserBioUpdateSchema,
    type ModData,
    type TagCreate,
    type UserBioUpdate
} from '@/schemas';

// ============================================================================
// PRE-CONFIGURED FORM HOOKS
// ============================================================================

/**
 * Form hook for mod creation/editing
 */
export function useModForm(
    defaultValues?: Partial<ModData>
): UseFormReturn<ModData> {
    return useForm<ModData>({
        resolver: zodResolver(ModDataSchema) as never,
        mode: 'onBlur',
        defaultValues: {
            title: '',
            slug: '',
            version: 'v1.0',
            author: '',
            description: '',
            status: 'active',
            gameVersion: 'V1.0',
            isSaveBreaking: false,
            features: [],
            tags: [],
            installationSteps: [],
            links: { download: '', discord: '', community: [], donations: [] },
            stats: { rating: 0, ratingCount: 0, downloads: '0', views: '0' },
            videos: { trailer: '', review: '' },
            screenshots: [],
            changelog: [],
            localizations: [],
            ...defaultValues
        }
    });
}

/**
 * Form hook for tag creation
 */
export function useTagForm(
    defaultValues?: Partial<TagCreate>
): UseFormReturn<TagCreate> {
    return useForm<TagCreate>({
        resolver: zodResolver(TagCreateSchema) as never,
        mode: 'onBlur',
        defaultValues: {
            category: 'tag',
            value: '',
            displayName: '',
            ...defaultValues
        }
    });
}

/**
 * Form hook for user bio update
 */
export function useBioForm(
    currentBio?: string
): UseFormReturn<UserBioUpdate> {
    return useForm<UserBioUpdate>({
        resolver: zodResolver(UserBioUpdateSchema) as never,
        mode: 'onBlur',
        defaultValues: {
            bio: currentBio || ''
        }
    });
}

// ============================================================================
// UTILITY: FORM ERROR DISPLAY
// ============================================================================

/**
 * Get error message for a field from react-hook-form errors
 */
export function getFieldError<T extends FieldValues>(
    errors: UseFormReturn<T>['formState']['errors'],
    field: keyof T
): string | undefined {
    const error = errors[field];
    if (error && 'message' in error) {
        return error.message as string;
    }
    return undefined;
}

