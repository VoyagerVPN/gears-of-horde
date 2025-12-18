import 'dotenv/config'
import { db as prisma } from '../src/lib/db'
import { recalculateGameVersionColors } from '../src/lib/tags'

async function main() {
    console.log('--- Testing Game Version Gradient ---')

    // 1. Cleanup existing gamever tags for clean test
    await prisma.tag.deleteMany({
        where: { category: 'gamever' }
    })

    // 2. Create Initial Versions: 1.3, 1.4, 2.0, 2.2, 2.3, 2.4
    const initialVersions = ['1_3', '1_4', '2_0', '2_2', '2_3', '2_4']
    console.log(`\nCreating versions: ${initialVersions.join(', ')}`)

    for (const ver of initialVersions) {
        await prisma.tag.create({
            data: {
                category: 'gamever',
                value: ver,
                displayName: `V${ver.replace('_', '.')}`,
                color: '#000000' // Placeholder
            }
        })
    }

    // 3. Recalculate
    console.log('Recalculating colors...')
    await recalculateGameVersionColors(prisma)

    // 4. Verify
    const tagsAfterFirst = await prisma.tag.findMany({
        where: { category: 'gamever' },
        orderBy: { value: 'asc' } // Note: string sort might be wrong for 1_10, but okay for now
    })

    // Custom sort for display to be sure
    tagsAfterFirst.sort((a, b) => {
        const partsA = a.value.split('_').map(Number)
        const partsB = b.value.split('_').map(Number)
        if (partsA[0] !== partsB[0]) return partsA[0] - partsB[0]
        return partsA[1] - partsB[1]
    })

    console.log('\nResults (Initial):')
    tagsAfterFirst.forEach(t => console.log(`${t.value}: ${t.color}`))

    // 5. Add New Version: 3.0
    console.log('\nAdding new version: 3_0')
    await prisma.tag.create({
        data: {
            category: 'gamever',
            value: '3_0',
            displayName: 'V3.0',
            color: '#000000'
        }
    })

    // 6. Recalculate
    console.log('Recalculating colors...')
    await recalculateGameVersionColors(prisma)

    // 7. Verify Again
    const tagsAfterSecond = await prisma.tag.findMany({
        where: { category: 'gamever' }
    })
    tagsAfterSecond.sort((a, b) => {
        const partsA = a.value.split('_').map(Number)
        const partsB = b.value.split('_').map(Number)
        if (partsA[0] !== partsB[0]) return partsA[0] - partsB[0]
        return partsA[1] - partsB[1]
    })

    console.log('\nResults (After 3.0):')
    tagsAfterSecond.forEach(t => console.log(`${t.value}: ${t.color}`))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        // await prisma.$disconnect()
    })
