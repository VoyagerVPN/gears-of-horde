/**
 * useModForm Hook
 * 
 * Manages form state for mod editing.
 * Follows SRP: only form state management, no validation, no API calls.
 */

import { useState, useCallback } from 'react';
import type { Mod } from '@/entities/mod';
import type { ModFormData } from '../types';

const EMPTY_FORM: ModFormData = {
  title: '',
  slug: '',
  version: 'v1.0',
  author: '',
  description: '',
  status: 'active',
  gameVersion: 'V1.0',
  bannerUrl: '',
  isSaveBreaking: false,
  features: [],
  tags: [
    { displayName: 'English', category: 'lang', value: 'EN', isExternal: false }
  ],
  installationSteps: [
    "Download the mod file.",
    "Extract the archive to your 7 Days to Die 'Mods' folder.",
    "Verify the folder structure: 'Mods/ModName/ModInfo.xml'.",
    "Start the game."
  ],
  links: { download: '', discord: '', community: [], donations: [] },
  videos: { trailer: '', review: '' },
  screenshots: [],
  changelog: [],
  localizations: [{ code: 'EN', name: 'English', type: 'builtin', url: '' }]
};

interface UseModFormProps {
  initialData?: Mod;
}

interface UseModFormReturn {
  formData: ModFormData;
  setFormData: React.Dispatch<React.SetStateAction<ModFormData>>;
  updateField: <K extends keyof ModFormData>(field: K, value: ModFormData[K]) => void;
  resetForm: () => void;
  isDirty: boolean;
}

export function useModForm({ initialData }: UseModFormProps = {}): UseModFormReturn {
  const [formData, setFormData] = useState<ModFormData>(() => {
    if (!initialData) return EMPTY_FORM;
    
    // Convert Mod entity to form data
    return {
      title: initialData.title,
      slug: initialData.slug,
      version: initialData.version,
      author: initialData.author,
      description: initialData.description,
      status: initialData.status,
      gameVersion: initialData.gameVersion,
      bannerUrl: initialData.bannerUrl,
      isSaveBreaking: initialData.isSaveBreaking,
      features: initialData.features,
      tags: initialData.tags,
      installationSteps: initialData.installationSteps,
      links: initialData.links,
      videos: initialData.videos,
      screenshots: initialData.screenshots,
      changelog: initialData.changelog,
      localizations: initialData.localizations.length > 0 
        ? initialData.localizations 
        : [{ code: 'EN', name: 'English', type: 'builtin', url: '' }]
    };
  });

  const [initialState] = useState(formData);

  const updateField = useCallback(<K extends keyof ModFormData>(
    field: K,
    value: ModFormData[K]
  ) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      
      // Auto-generate slug from title for new mods
      if (field === 'title' && !initialData?.slug) {
        const { slugify } = require('@/lib/utils');
        next.slug = slugify(value as string);
      }
      
      // Sync version with changelog
      if (field === 'changelog' && Array.isArray(value) && value.length > 0) {
        const firstEntry = value[0];
        if (firstEntry && typeof firstEntry === 'object' && 'version' in firstEntry) {
          if (firstEntry.version !== prev.version) {
            next.version = firstEntry.version;
          }
        }
      }
      
      return next;
    });
  }, [initialData?.slug]);

  const resetForm = useCallback(() => {
    setFormData(initialState);
  }, [initialState]);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialState);

  return {
    formData,
    setFormData,
    updateField,
    resetForm,
    isDirty
  };
}
