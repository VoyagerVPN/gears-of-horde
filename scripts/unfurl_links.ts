import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '../src/generated/prisma'
import ws from 'ws'
import * as cheerio from 'cheerio'

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

interface ModLink {
    name?: string
    url: string
}

interface ModLinks {
    download: string
    discord: string
    community: ModLink[]
    donations: ModLink[]
}

// Unfurl a single URL to get its title
async function unfurlUrl(url: string): Promise<string> {
    try {
        const parsedUrl = new URL(url)

        // Fetch the page
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            signal: AbortSignal.timeout(8000),
        })

        // For 403/blocked sites, extract site name from domain
        if (!response.ok) {
            const domainParts = parsedUrl.hostname.replace('www.', '').split('.')
            return domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1)
        }

        const html = await response.text()
        const $ = cheerio.load(html)

        // Extract title - prioritize site name
        let title = $('meta[property="og:site_name"]').attr('content')
            || $('meta[property="og:title"]').attr('content')
            || $('meta[name="twitter:title"]').attr('content')
            || $('title').text()
            || ''

        title = title.trim()

        // Clean up compound titles
        if (title.includes(' | ')) {
            const parts = title.split(' | ')
            title = parts[parts.length - 1].trim()
        } else if (title.includes(' - ') && !$('meta[property="og:site_name"]').attr('content')) {
            const parts = title.split(' - ')
            title = parts[parts.length - 1].trim()
        }

        return title || parsedUrl.hostname.replace('www.', '').split('.')[0]
    } catch (error) {
        // Fallback to domain name
        try {
            const parsedUrl = new URL(url)
            const domainParts = parsedUrl.hostname.replace('www.', '').split('.')
            return domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1)
        } catch {
            return 'Link'
        }
    }
}

async function main() {
    console.log('Fetching all mods from database...')

    const mods = await prisma.mod.findMany({
        select: {
            slug: true,
            title: true,
            links: true
        }
    })

    console.log(`Found ${mods.length} mods to process.\n`)

    let updatedCount = 0

    for (const mod of mods) {
        const links = mod.links as ModLinks
        let needsUpdate = false

        // Process community links
        if (links.community && Array.isArray(links.community)) {
            for (const link of links.community) {
                if (!link.name || link.name.trim() === '') {
                    console.log(`  Unfurling: ${link.url}`)
                    const title = await unfurlUrl(link.url)
                    link.name = title
                    needsUpdate = true
                    console.log(`    → ${title}`)
                    // Small delay to avoid rate limiting
                    await new Promise(r => setTimeout(r, 300))
                }
            }
        }

        // Process donation links
        if (links.donations && Array.isArray(links.donations)) {
            for (const link of links.donations) {
                if (!link.name || link.name.trim() === '') {
                    console.log(`  Unfurling: ${link.url}`)
                    const title = await unfurlUrl(link.url)
                    link.name = title
                    needsUpdate = true
                    console.log(`    → ${title}`)
                    await new Promise(r => setTimeout(r, 300))
                }
            }
        }

        if (needsUpdate) {
            await prisma.mod.update({
                where: { slug: mod.slug },
                data: { links }
            })
            updatedCount++
            console.log(`✓ Updated ${mod.title}\n`)
        }
    }

    console.log(`\nDone! Updated ${updatedCount} mods with unfurled link names.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
