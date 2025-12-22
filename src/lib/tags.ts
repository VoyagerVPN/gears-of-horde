import { PrismaClient } from '@/generated/prisma'
import { GAME_VERSION_COLORS } from './tag-colors'

// ============================================================================
// VERSION PARSING UTILITIES
// ============================================================================

/**
 * Parse version string "1_4" -> [1, 4]
 */
export function parseVersion(version: string): number[] {
    // Remove 'v' prefix and any other non-numeric chars (except . and _)
    const cleanVersion = version.toLowerCase().replace(/[^0-9._]/g, '')
    // Replace underscores with dots and split
    return cleanVersion.replace(/_/g, '.').split('.').map(Number)
}

/**
 * Compare two version strings
 * @returns negative if a < b, positive if a > b, 0 if equal
 */
export function compareVersions(a: string, b: string): number {
    const partsA = parseVersion(a)
    const partsB = parseVersion(b)

    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const valA = partsA[i] || 0
        const valB = partsB[i] || 0
        if (valA !== valB) {
            return valA - valB
        }
    }
    return 0
}

// ============================================================================
// COLOR INTERPOLATION
// ============================================================================

// Parse hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
}

/**
 * Interpolate between game version gradient colors
 * Uses colors from GAME_VERSION_COLORS constant
 */
function interpolateColor(factor: number): string {
    const startColor = hexToRgb(GAME_VERSION_COLORS.oldest)
    const endColor = hexToRgb(GAME_VERSION_COLORS.newest)

    const r = Math.round(startColor.r + (endColor.r - startColor.r) * factor)
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * factor)
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * factor)

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export async function recalculateGameVersionColors(prisma: PrismaClient) {
    // 1. Fetch all gamever tags
    const tags = await prisma.tag.findMany({
        where: { category: 'gamever' }
    })

    if (tags.length === 0) return []

    // 2. Sort tags by version
    const sortedTags = tags.sort((a, b) => compareVersions(a.value, b.value))

    // 3. Prepare updates
    const updates = sortedTags.map((tag, index) => {
        let color: string
        if (sortedTags.length === 1) {
            color = GAME_VERSION_COLORS.newest // Green if only one version
        } else {
            const factor = index / (sortedTags.length - 1)
            color = interpolateColor(factor)
        }

        return prisma.tag.update({
            where: { id: tag.id },
            data: { color }
        })
    })

    // 4. Execute updates
    await prisma.$transaction(updates)

    // 5. Return updated values (re-calculating color for return to avoid complex type mapping from transaction result)
    return sortedTags.map((t, i) => {
        let color: string
        if (sortedTags.length === 1) {
            color = GAME_VERSION_COLORS.newest
        } else {
            const factor = i / (sortedTags.length - 1)
            color = interpolateColor(factor)
        }
        return {
            value: t.value,
            color: color
        }
    })
}
