/**
 * Create Mod API
 * 
 * Server action for creating a new mod using Supabase.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { ModDataSchema } from '@/schemas';
import { validate, type Result } from '@/lib/result';
import { db } from '@/lib/db';
import { ROUTES } from '@/lib/routes';
import { normalizeGameVersion } from '@/lib/utils';
import type { Mod } from '@/entities/mod';

export interface CreateModInput {
  title: string;
  slug: string;
  version: string;
  author: string;
  description: string;
  status: string;
  gameVersion: string;
  bannerUrl: string;
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

interface CreateModSuccess {
  slug: string;
  mod: Mod;
}

export async function createMod(
  input: CreateModInput
): Promise<Result<CreateModSuccess, string>> {
  try {
    // Validate input
    const validation = validate(ModDataSchema, input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error
      };
    }

    const data = validation.data;

    // Check for duplicate slug
    const { data: existing } = await db
      .from('Mod')
      .select('slug')
      .eq('slug', data.slug)
      .single();

    if (existing) {
      return {
        success: false,
        error: 'A mod with this slug already exists'
      };
    }

    // Create mod
    const { data: mod, error } = await db
      .from('Mod')
      .insert({
        title: data.title,
        slug: data.slug,
        version: data.version,
        author: data.author,
        description: data.description,
        status: data.status,
        gameVersion: normalizeGameVersion(data.gameVersion),
        bannerUrl: data.bannerUrl,
        isSaveBreaking: data.isSaveBreaking ?? false,
        features: data.features || [],
        installationSteps: data.installationSteps || [],
        links: data.links,
        videos: data.videos,
        screenshots: data.screenshots,
        changelog: data.changelog,
        localizations: data.localizations,
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    if (!mod) {
      return {
        success: false,
        error: 'Failed to create mod'
      };
    }

    revalidatePath(ROUTES.mods);
    revalidatePath(`${ROUTES.mods}/${mod.slug}`);

    return {
      success: true,
      data: {
        slug: mod.slug,
        mod: mod as unknown as Mod
      }
    };
  } catch (error) {
    console.error('Failed to create mod:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
