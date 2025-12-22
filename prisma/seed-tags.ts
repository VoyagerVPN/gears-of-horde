import 'dotenv/config'
import { db as prisma } from '../src/lib/db'

async function main() {
    console.log('Start seeding tags...')

    // 1. Create Tags
    const gameVerTag = await prisma.tag.upsert({
        where: { category_value: { category: 'gamever', value: '1_0' } },
        update: {},
        create: {
            category: 'gamever',
            value: '1_0',
            displayName: 'V1.0',
            color: '#ff0000'
        }
    })
    console.log('Created Tag:', gameVerTag)

    const newsCatTag = await prisma.tag.upsert({
        where: { category_value: { category: 'newscat', value: 'release' } },
        update: {},
        create: {
            category: 'newscat',
            value: 'release',
            displayName: 'RELEASE',
            color: '#00ffff'
        }
    })
    console.log('Created Tag:', newsCatTag)

    // 2. Create Mod with Tag
    const mod = await prisma.mod.upsert({
        where: { slug: 'test-mod-tags' },
        update: {},
        create: {
            slug: 'test-mod-tags',
            title: 'Test Mod for Tags',
            version: '1.0.0',
            author: 'TestAuthor',
            description: 'Testing tags',
            status: 'active',
            gameVersion: '1.0',
            links: {},
            videos: {},
            changelog: [],
            localizations: {},
            tags: {
                create: {
                    tag: {
                        connect: { id: gameVerTag.id }
                    }
                }
            }
        }
    })
    console.log('Created Mod:', mod)

    // 3. Create News with frozen snapshot data
    const news = await prisma.news.create({
        data: {
            modSlug: mod.slug,
            modName: mod.title,
            modVersion: mod.version,
            gameVersion: mod.gameVersion,
            actionText: 'released',
            content: 'This is a test news item.',
            description: 'Test news description',
            tags: [
                { displayName: newsCatTag.displayName, color: newsCatTag.color, category: newsCatTag.category },
                { displayName: gameVerTag.displayName, color: gameVerTag.color, category: gameVerTag.category }
            ]
        }
    })
    console.log('Created News:', news)

    // 4. Verify Relations
    const modWithTags = await prisma.mod.findUnique({
        where: { slug: 'test-mod-tags' },
        include: { tags: { include: { tag: true } } }
    })
    console.log('Mod with Tags:', JSON.stringify(modWithTags?.tags, null, 2))

    const newsItem = await prisma.news.findUnique({
        where: { id: news.id }
    })
    console.log('News with frozen tags:', JSON.stringify(newsItem?.tags, null, 2))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        // db connection is managed by the imported module, but we can try to disconnect if needed
        // await prisma.$disconnect() 
    })
