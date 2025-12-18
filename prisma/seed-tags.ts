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

    // 3. Create News with Tags
    const news = await prisma.news.create({
        data: {
            title: 'Test News Release',
            content: 'This is a test news item.',
            tags: {
                create: [
                    { tag: { connect: { id: newsCatTag.id } } },
                    { tag: { connect: { id: gameVerTag.id } } }
                ]
            },
            mod: {
                connect: { slug: mod.slug }
            }
        }
    })
    console.log('Created News:', news)

    // 4. Verify Relations
    const modWithTags = await prisma.mod.findUnique({
        where: { slug: 'test-mod-tags' },
        include: { tags: { include: { tag: true } } }
    })
    console.log('Mod with Tags:', JSON.stringify(modWithTags?.tags, null, 2))

    const newsWithTags = await prisma.news.findUnique({
        where: { id: news.id },
        include: { tags: { include: { tag: true } } }
    })
    console.log('News with Tags:', JSON.stringify(newsWithTags?.tags, null, 2))
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
