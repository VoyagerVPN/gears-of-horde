import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '../src/generated/prisma'
import ws from 'ws'
import fs from 'fs'
import path from 'path'

// Load environment variables (Node.js v21.7+)
process.loadEnvFile()

// Setup WebSocket constructor for the Neon serverless driver
if (!neonConfig.webSocketConstructor) {
    neonConfig.webSocketConstructor = ws
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    console.error("DATABASE_URL is not defined")
    process.exit(1)
}

// Initialize Prisma with the Neon adapter
const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })

interface Localization {
    code: string
    name: string
    type: 'builtin' | 'external'
    url?: string
}

interface ModData {
    slug: string
    title: string
    version: string
    author: string
    description: string
    status: string
    gameVersion: string
    bannerUrl: string
    isSaveBreaking: boolean
    features: string[]
    links: {
        download: string
        discord: string
        community: { url: string }[]
        donations: { url: string }[]
    }
    videos: {
        trailer: string
        review: string
    }
    localizations: Localization[]
    screenshots: string[]
    rating: number
    ratingCount: number
    downloads: string
    views: string
    downloadsThisMonth: number
    changelog: unknown[]
    installationSteps: string[]
}

async function validateMods(modsData: ModData[]): Promise<{ valid: ModData[], errors: { mod: string, issues: string[] }[] }> {
    const valid: ModData[] = []
    const errors: { mod: string, issues: string[] }[] = []

    for (const mod of modsData) {
        const issues: string[] = []

        // Required fields
        if (!mod.slug || mod.slug.length === 0) issues.push('Missing slug')
        if (!mod.title || mod.title.length === 0) issues.push('Missing title')
        // Description can be empty/short - we'll add placeholder if needed
        if (!mod.version) issues.push('Missing version')
        if (!mod.author) issues.push('Missing author')
        if (!mod.status) issues.push('Missing status')
        if (!mod.gameVersion) issues.push('Missing gameVersion')

        // Status validation
        const validStatuses = ['active', 'on_hold', 'discontinued', 'upcoming', 'unknown']
        if (mod.status && !validStatuses.includes(mod.status)) {
            issues.push(`Invalid status: ${mod.status}`)
        }

        // Slug format
        if (mod.slug && !/^[a-z0-9-]+$/.test(mod.slug)) {
            issues.push(`Invalid slug format: ${mod.slug}`)
        }

        if (issues.length > 0) {
            errors.push({ mod: mod.title || mod.slug, issues })
        } else {
            valid.push(mod)
        }
    }

    return { valid, errors }
}

async function main() {
    const modsDataPath = path.join(process.cwd(), 'extracted_mods.json')
    const modsData: ModData[] = JSON.parse(fs.readFileSync(modsDataPath, 'utf8'))

    console.log(`Found ${modsData.length} mods to import...`)

    // Validate first
    const { valid, errors } = await validateMods(modsData)

    if (errors.length > 0) {
        console.log('\n⚠️ Validation Issues Found:')
        for (const err of errors) {
            console.log(`  - ${err.mod}: ${err.issues.join(', ')}`)
        }
        console.log(`\n${valid.length} mods are valid, ${errors.length} have issues.`)
    }

    // Proceed with valid mods
    for (const modData of valid) {
        console.log(`Processing ${modData.title}...`)

        // 1. Create/Get Tags
        const tagIds: string[] = []

        // Game Version Tag
        if (modData.gameVersion) {
            const tag = await prisma.tag.upsert({
                where: { category_value: { category: 'gamever', value: modData.gameVersion.toLowerCase().replace(/\./g, '_') } },
                create: {
                    category: 'gamever',
                    value: modData.gameVersion.toLowerCase().replace(/\./g, '_'),
                    displayName: modData.gameVersion
                },
                update: {}
            })
            tagIds.push(tag.id)
        }

        // Author Tag (Split by comma if multiple)
        if (modData.author) {
            const authors = modData.author.split(',').map((a: string) => a.trim())
            for (const author of authors) {
                const value = author.toLowerCase().replace(/\s+/g, '_')
                const tag = await prisma.tag.upsert({
                    where: { category_value: { category: 'author', value: value } },
                    create: {
                        category: 'author',
                        value: value,
                        displayName: author
                    },
                    update: {}
                })
                tagIds.push(tag.id)
            }
        }

        // Language Tags from localizations array
        const langTagData: { tagId: string; isExternal: boolean; externalLink?: string }[] = []
        if (modData.localizations && Array.isArray(modData.localizations)) {
            for (const loc of modData.localizations) {
                const value = loc.name.toLowerCase().replace(/\s+/g, '_')
                const tag = await prisma.tag.upsert({
                    where: { category_value: { category: 'lang', value: value } },
                    create: {
                        category: 'lang',
                        value: value,
                        displayName: loc.name
                    },
                    update: {}
                })
                langTagData.push({
                    tagId: tag.id,
                    isExternal: loc.type === 'external',
                    externalLink: loc.url
                })
            }
        }

        // 2. Upsert Mod
        try {
            // First delete existing ModTag entries to avoid duplicates
            await prisma.modTag.deleteMany({
                where: { modId: modData.slug }
            })

            const description = modData.description?.trim() || `${modData.title} is a mod for 7 Days to Die.`;

            const mod = await prisma.mod.upsert({
                where: { slug: modData.slug },
                update: {
                    title: modData.title,
                    version: modData.version,
                    author: modData.author,
                    description: description,
                    status: modData.status,
                    gameVersion: modData.gameVersion,
                    bannerUrl: modData.bannerUrl || null,
                    isSaveBreaking: modData.isSaveBreaking || false,
                    features: modData.features || [],
                    installationSteps: modData.installationSteps || [],
                    links: modData.links || {},
                    videos: modData.videos || {},
                    localizations: modData.localizations || [],
                    screenshots: modData.screenshots || [],
                    changelog: modData.changelog || [],
                    updatedAt: new Date()
                },
                create: {
                    slug: modData.slug,
                    title: modData.title,
                    version: modData.version,
                    author: modData.author,
                    description: description,
                    status: modData.status,
                    gameVersion: modData.gameVersion,
                    bannerUrl: modData.bannerUrl || null,
                    isSaveBreaking: modData.isSaveBreaking || false,
                    features: modData.features || [],
                    installationSteps: modData.installationSteps || [],
                    links: modData.links || {},
                    videos: modData.videos || {},
                    localizations: modData.localizations || [],
                    screenshots: modData.screenshots || [],
                    changelog: modData.changelog || [],
                    rating: modData.rating || 0,
                    ratingCount: modData.ratingCount || 0,
                    downloads: modData.downloads || "0",
                    views: modData.views || "0",
                    downloadsThisMonth: modData.downloadsThisMonth || 0
                }
            })

            // Create ModTag entries
            for (const tagId of tagIds) {
                await prisma.modTag.create({
                    data: { modId: mod.slug, tagId }
                })
            }

            for (const lt of langTagData) {
                await prisma.modTag.create({
                    data: {
                        modId: mod.slug,
                        tagId: lt.tagId,
                        isExternal: lt.isExternal,
                        externalLink: lt.externalLink
                    }
                })
            }

            console.log(`✓ Imported ${mod.slug}`)
        } catch (err) {
            console.error(`✗ Failed to import ${modData.slug}:`, err)
        }
    }

    console.log(`\nDone! Imported ${valid.length} mods.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
