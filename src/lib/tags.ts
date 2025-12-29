import { PrismaClient } from '@/generated/prisma'
import { GAME_VERSION_COLORS } from './tag-colors'

// ============================================================================
// VERSION PARSING UTILITIES
// ============================================================================

/**
 * Parse version string to extract numeric parts and build number
 * Examples: "1_4" -> [1, 4, 0], "a20" -> [20, 0], "1_1b14" -> [1, 1, 14]
 */
export function parseVersion(version: string): { parts: number[], build: number, isAlpha: boolean } {
    const normalizedVersion = version.toLowerCase()

    // Check for Alpha version
    const isAlpha = normalizedVersion.startsWith('a')

    // Remove prefix (a, v) and any other non-numeric chars except . _ and b
    const cleanVersion = normalizedVersion.replace(/^[av]/, '')

    // Extract build number if present (e.g., "1_1b14" -> build=14)
    const buildMatch = cleanVersion.match(/b(\d+)$/)
    const build = buildMatch ? parseInt(buildMatch[1]) : 0

    // Remove build part and split into version parts
    const versionStr = cleanVersion.replace(/b\d+$/, '')
    const parts = versionStr.replace(/_/g, '.').split('.').map(Number).filter(n => !isNaN(n))

    return { parts, build, isAlpha }
}

/**
 * Compare two version strings
 * Order: N/A < A20 < A21 < V1.0 < V1.1 < V1.1b14 < V1.2
 * @returns negative if a < b, positive if a > b, 0 if equal
 */
export function compareVersions(a: string, b: string): number {
    const aUpper = a.toUpperCase()
    const bUpper = b.toUpperCase()

    // N/A handling - treat as oldest
    if (aUpper === 'N/A' && bUpper === 'N/A') return 0
    if (aUpper === 'N/A') return -1
    if (bUpper === 'N/A') return 1

    const { parts: partsA, build: buildA, isAlpha: isAlphaA } = parseVersion(a)
    const { parts: partsB, build: buildB, isAlpha: isAlphaB } = parseVersion(b)

    // Alpha versions come before V versions
    if (isAlphaA && !isAlphaB) return -1
    if (!isAlphaA && isAlphaB) return 1

    // Compare version parts
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const valA = partsA[i] || 0
        const valB = partsB[i] || 0
        if (valA !== valB) {
            return valA - valB
        }
    }

    // If version parts are equal, compare build numbers
    return buildA - buildB
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

    // 2. Separate N/A from regular versions
    const naTags = tags.filter(t => t.value.toLowerCase() === 'na')
    const regularTags = tags.filter(t => t.value.toLowerCase() !== 'na')

    // 3. Sort regular tags by version (exclude N/A from gradient)
    const sortedTags = regularTags.sort((a, b) => compareVersions(a.value, b.value))

    // 4. Prepare updates
    const updates = []

    // N/A tags get constant zinc color
    for (const tag of naTags) {
        updates.push(prisma.tag.update({
            where: { id: tag.id },
            data: { color: GAME_VERSION_COLORS.na }
        }))
    }

    // Regular tags get gradient colors
    for (let index = 0; index < sortedTags.length; index++) {
        const tag = sortedTags[index]
        let color: string
        if (sortedTags.length === 1) {
            color = GAME_VERSION_COLORS.newest // Green if only one version
        } else {
            const factor = index / (sortedTags.length - 1)
            color = interpolateColor(factor)
        }

        updates.push(prisma.tag.update({
            where: { id: tag.id },
            data: { color }
        }))
    }

    // 5. Execute updates
    await prisma.$transaction(updates)

    // 6. Return updated values
    const results = []

    // Add N/A results
    for (const tag of naTags) {
        results.push({
            value: tag.value,
            color: GAME_VERSION_COLORS.na
        })
    }

    // Add regular version results
    for (let i = 0; i < sortedTags.length; i++) {
        const tag = sortedTags[i]
        let color: string
        if (sortedTags.length === 1) {
            color = GAME_VERSION_COLORS.newest
        } else {
            const factor = i / (sortedTags.length - 1)
            color = interpolateColor(factor)
        }
        results.push({
            value: tag.value,
            color: color
        })
    }

    return results
}
