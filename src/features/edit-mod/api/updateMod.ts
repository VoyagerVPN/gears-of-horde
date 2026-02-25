/**
 * Update Mod API
 * 
 * Server action for updating an existing mod using Supabase.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { ModDataSchema } from '@/schemas';
import { validate, type Result } from '@/lib/result';
import { db } from '@/lib/db';
import { ROUTES } from '@/lib/routes';
import { normalizeGameVersion } from '@/lib/utils';
import type { Mod } from '@/entities/mod';

export interface UpdateModInput {
  title?: string;
  slug?: string;
  version?: string;
  author?: string;
  description?: string;
  status?: string;
  gameVersion?: string;
  bannerUrl?: string;
  isSaveBreaking?: boolean;
  features?: string[];
  tags?: Array<{
    displayName: string;
    category?: string;
    value?: string;
    color?: string | null;
  }>;
  installationSteps?: string[];
  links?: {
    download?: string;
    discord?: string;
    community?: Array<{ name: string; url: string }>;
    donations?: Array<{ name: string; url: string }>;
  };
  videos?: {
    trailer?: string;
    review?: string;
  };
  screenshots?: string[];
  changelog?: Array<{
    version: string;
    date: string;
    changes: string[];
  }>;
  localizations?: Array<{
    code: string;
    name: string;
    type: 'builtin' | 'external';
    url?: string;
  }>;
}

interface UpdateModSuccess {
  slug: string;
  mod: Mod;
}

export async function updateMod(
  currentSlug: string,
  input: UpdateModInput
): Promise<Result<UpdateModSuccess, string>> {
  try {
    // Partial validation for updates
    const validation = validate(ModDataSchema.partial(), input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error
      };
    }

    const data = validation.data;

    // Check if mod exists
    const { data: existing } = await db
      .from('Mod')
      .select('slug')
      .eq('slug', currentSlug)
      .single();

    if (!existing) {
      return {
        success: false,
        error: 'Mod not found'
      };
    }

    // Check for slug conflict if changing slug
    if (data.slug && data.slug !== currentSlug) {
      const { data: slugExists } = await db
        .from('Mod')
        .select('slug')
        .eq('slug', data.slug)
        .single();

      if (slugExists) {
        return {
          success: false,
          error: 'A mod with this slug already exists'
        };
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.version !== undefined) updateData.version = data.version;
    if (data.author !== undefined) updateData.author = data.author;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.gameVersion !== undefined) {
      updateData.gameVersion = normalizeGameVersion(data.gameVersion);
    }
    if (data.bannerUrl !== undefined) updateData.bannerUrl = data.bannerUrl;
    if (data.isSaveBreaking !== undefined) updateData.isSaveBreaking = data.isSaveBreaking;
    if (data.features !== undefined) updateData.features = data.features;
    if (data.installationSteps !== undefined) updateData.installationSteps = data.installationSteps;
    if (data.links !== undefined) updateData.links = data.links;
    if (data.videos !== undefined) updateData.videos = data.videos;
    if (data.screenshots !== undefined) updateData.screenshots = data.screenshots;
    if (data.changelog !== undefined) updateData.changelog = data.changelog;
    if (data.localizations !== undefined) updateData.localizations = data.localizations;

    // Update mod
    const { data: mod, error } = await db
      .from('Mod')
      .update(updateData)
      .eq('slug', currentSlug)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    if (!mod) {
      return {
        success: false,
        error: 'Failed to update mod'
      };
    }

    // Revalidate paths
    revalidatePath(ROUTES.mods);
    revalidatePath(`${ROUTES.mods}/${currentSlug}`);
    if (data.slug && data.slug !== currentSlug) {
      revalidatePath(`${ROUTES.mods}/${data.slug}`);
    }

    return {
      success: true,
      data: {
        slug: mod.slug,
        mod: mod as unknown as Mod
      }
    };
  } catch (error) {
    console.error('Failed to update mod:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
