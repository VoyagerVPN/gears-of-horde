
import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

async function run() {
    const { db } = await import("@/lib/db");

    const tagsToCheck = ["A20.5B2", "A20.7"];

    console.log("Checking for tags:", tagsToCheck);

    // Check by displayName
    const tagsByDisplay = await db.tag.findMany({
        where: {
            category: 'gamever',
            displayName: { in: tagsToCheck }
        }
    });

    // Check by value (normalized)
    const values = tagsToCheck.map(t => t.toLowerCase().replace(/\./g, '_'));
    const tagsByValue = await db.tag.findMany({
        where: {
            category: 'gamever',
            value: { in: values }
        }
    });

    console.log("\n--- Results ---");

    console.log("Found by Display Name:");
    if (tagsByDisplay.length === 0) console.log("  None");
    tagsByDisplay.forEach(t => console.log(`  - ID: ${t.id}, Value: ${t.value}, Display: ${t.displayName}`));

    console.log("\nFound by Value:");
    if (tagsByValue.length === 0) console.log("  None");
    tagsByValue.forEach(t => console.log(`  - ID: ${t.id}, Value: ${t.value}, Display: ${t.displayName}`));

    console.log("\n--- Checking Mods ---");
    // Check if any mods use these strings in their gameVersion field
    const modsWithStrings = await db.mod.findMany({
        where: {
            gameVersion: { in: tagsToCheck }
        },
        select: { slug: true, title: true, gameVersion: true }
    });

    console.log("Mods with these strings in gameVersion field:");
    if (modsWithStrings.length === 0) console.log("  None");
    modsWithStrings.forEach(m => console.log(`  - [${m.slug}] ${m.title} (gameVersion: ${m.gameVersion})`));

}

run().catch(console.error);
