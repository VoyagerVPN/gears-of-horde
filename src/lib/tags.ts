import { PrismaClient } from '@prisma/client'

// Helper to parse version string "1_4" -> [1, 4]
function parseVersion(version: string): number[] {
    return version.split('_').map(Number)
}

// Helper to compare versions
function compareVersions(a: string, b: string): number {
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

// Helper to interpolate color
// Start: Red (239, 68, 68) #ef4444
// End: Green (34, 197, 94) #22c55e
function interpolateColor(factor: number): string {
    const startColor = { r: 239, g: 68, b: 68 }
    const endColor = { r: 34, g: 197, b: 94 }

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
            color = '#22c55e' // Green if only one version
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
            color = '#22c55e'
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
