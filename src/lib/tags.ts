import { db } from './db'
import { GAME_VERSION_COLORS } from './tag-colors'

import { compareGameVersions as compareVersions } from './utils'

// ============================================================================
// COLOR INTERPOLATION
// ============================================================================

function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
}

function interpolateColor(factor: number): string {
    const startColor = hexToRgb(GAME_VERSION_COLORS.oldest)
    const endColor = hexToRgb(GAME_VERSION_COLORS.newest)

    const r = Math.round(startColor.r + (endColor.r - startColor.r) * factor)
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * factor)
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * factor)

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export async function recalculateGameVersionColors(): Promise<{ value: string; color: string }[]> {
    // 1. Fetch all gamever tags
    const { data: tags, error: fetchError } = await db
        .from('Tag')
        .select('*')
        .eq('category', 'gamever');

    if (fetchError || !tags) throw new Error(`Fetch error: ${fetchError?.message}`);
    if (tags.length === 0) return [];

    // 2. Separate N/A from regular versions
    const naTags = tags.filter(t => t.value.toLowerCase() === 'na')
    const regularTags = tags.filter(t => t.value.toLowerCase() !== 'na')

    // 3. Sort regular tags by version
    const sortedTags = regularTags.sort((a, b) => compareVersions(a.value, b.value))

    // 4. Collect updates for bulk operation
    const updates: { id: string; color: string }[] = []
    const results: { value: string; color: string }[] = []

    // 5. Process N/A tags
    for (const tag of naTags) {
        updates.push({ id: tag.id, color: GAME_VERSION_COLORS.na })
        results.push({ value: tag.value, color: GAME_VERSION_COLORS.na })
    }

    // 6. Process regular tags with gradient
    for (let i = 0; i < sortedTags.length; i++) {
        const tag = sortedTags[i]
        let color: string
        if (sortedTags.length === 1) {
            color = GAME_VERSION_COLORS.newest
        } else {
            const factor = i / (sortedTags.length - 1)
            color = interpolateColor(factor)
        }

        updates.push({ id: tag.id, color })
        results.push({ value: tag.value, color })
    }

    // 7. Perform bulk update via RPC
    const { error: updateError } = await db.rpc('bulk_update_tag_colors', {
        updates: updates
    });

    if (updateError) {
        console.error('Error during bulk tag color update:', updateError);
        throw new Error(`Update error: ${updateError.message}`);
    }

    return results
}

