import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '../src/generated/prisma'
import ws from 'ws'

// Load environment variables
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

function getFixedName(url: string, currentName: string): string | null {
    try {
        const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`)
        const hostname = parsedUrl.hostname.toLowerCase().replace('www.', '')

        if (hostname === 'paypal.com' || hostname === 'paypal.me') {
            return 'Paypal'
        }
        if (hostname === 'boosty.to') {
            return 'Boosty'
        }
        if (hostname === 'twitter.com' || hostname === 'x.com') {
            return 'X'
        }
    } catch (e) {
        // If URL is invalid, we can't do much
    }
    return null
}

async function main() {
    console.log('Fetching all mods and submissions from database...')

    const [mods, submissions] = await Promise.all([
        prisma.mod.findMany({
            select: {
                slug: true,
                title: true,
                links: true
            }
        }),
        prisma.modSubmission.findMany({
            select: {
                id: true,
                title: true,
                links: true
            }
        })
    ])

    console.log(`Found ${mods.length} mods and ${submissions.length} submissions to process.\n`)

    let modUpdatedCount = 0
    let submissionUpdatedCount = 0

    // Process Mods
    for (const mod of mods) {
        const links = mod.links as ModLinks
        let needsUpdate = false

        const processLinkArray = (linksArr: ModLink[]) => {
            if (linksArr && Array.isArray(linksArr)) {
                for (const link of linksArr) {
                    const fixedName = getFixedName(link.url, link.name || '')
                    if (fixedName && link.name !== fixedName) {
                        console.log(`  Updating mod ${mod.title} link: ${link.url} (${link.name}) -> ${fixedName}`)
                        link.name = fixedName
                        needsUpdate = true
                    }
                }
            }
        }

        processLinkArray(links.community)
        processLinkArray(links.donations)

        if (needsUpdate) {
            await prisma.mod.update({
                where: { slug: mod.slug },
                data: { links: links as any }
            })
            modUpdatedCount++
        }
    }

    // Process Submissions
    for (const submission of submissions) {
        const links = submission.links as ModLinks
        let needsUpdate = false

        const processLinkArray = (linksArr: ModLink[]) => {
            if (linksArr && Array.isArray(linksArr)) {
                for (const link of linksArr) {
                    const fixedName = getFixedName(link.url, link.name || '')
                    if (fixedName && link.name !== fixedName) {
                        console.log(`  Updating submission ${submission.title} link: ${link.url} (${link.name}) -> ${fixedName}`)
                        link.name = fixedName
                        needsUpdate = true
                    }
                }
            }
        }

        processLinkArray(links.community)
        processLinkArray(links.donations)

        if (needsUpdate) {
            await prisma.modSubmission.update({
                where: { id: submission.id },
                data: { links: links as any }
            })
            submissionUpdatedCount++
        }
    }

    console.log(`\nDone! Updated ${modUpdatedCount} mods and ${submissionUpdatedCount} submissions.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
