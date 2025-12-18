import 'dotenv/config'
import { db as prisma } from '../src/lib/db'

async function main() {
    console.log('Start seeding news tags...')

    const newsTags = [
        { value: 'new', displayName: 'NEW', color: '#a855f7' },      // Purple
        { value: 'update', displayName: 'UPDATE', color: '#22c55e' }, // Green
        { value: 'release', displayName: 'RELEASE', color: '#06b6d4' }, // Cyan
        { value: 'status', displayName: 'STATUS', color: '#9ca3af' }   // Gray/White
    ]

    for (const tag of newsTags) {
        const result = await prisma.tag.upsert({
            where: {
                category_value: {
                    category: 'newscat',
                    value: tag.value
                }
            },
            update: {
                displayName: tag.displayName,
                color: tag.color
            },
            create: {
                category: 'newscat',
                value: tag.value,
                displayName: tag.displayName,
                color: tag.color
            }
        })
        console.log(`Upserted tag: ${result.displayName}`)
    }

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        // prisma disconnect is handled by the imported db instance usually, 
        // but for a script we might want to ensure exit
    })
