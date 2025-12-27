import 'dotenv/config'
import { db as prisma } from '../src/lib/db'

const commonLanguages = [
    'English',
    'Russian',
    'German',
    'French',
    'Spanish',
    'Italian',
    'Portuguese',
    'Polish',
    'Ukrainian',
    'Chinese',
    'Japanese',
    'Korean',
    'Turkish',
    'Arabic',
    'Dutch',
    'Swedish',
    'Czech',
    'Hungarian',
    'Romanian',
    'Thai',
    'Vietnamese',
    'Indonesian',
]

async function main() {
    console.log('Seeding languages...')

    for (const name of commonLanguages) {
        const value = name.toLowerCase().replace(/\s+/g, '_')
        const tag = await prisma.tag.upsert({
            where: { category_value: { category: 'lang', value } },
            update: { displayName: name }, // Update name if exists
            create: {
                category: 'lang',
                value,
                displayName: name,
                color: null
            }
        })
        console.log(`Created language: ${tag.displayName}`)
    }

    console.log('Done seeding languages!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
