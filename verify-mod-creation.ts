import 'dotenv/config';
import { createMod } from "./src/app/actions/mod-actions";
import { ModData } from "./src/types/mod";
import { db as prisma } from "./src/lib/db";

async function main() {
    const testSlug = "test-mod-" + Date.now();
    const testMod: ModData = {
        title: "Test Mod",
        slug: testSlug,
        version: "1.0.0",
        author: "Test Author",
        description: "This is a test mod created by verification script.",
        status: "active",
        gameVersion: "1.0",
        isSaveBreaking: false,
        features: ["Feature 1", "Feature 2"],
        tags: [{ displayName: "Tag1" }, { displayName: "Tag2" }],
        installationSteps: ["Step 1", "Step 2"],
        links: {
            download: "http://example.com/download",
            discord: "http://discord.gg/test",
            community: [],
            donations: []
        },
        stats: {
            rating: 5,
            ratingCount: 1,
            downloads: "100",
            views: "200"
        },
        videos: {
            trailer: "http://youtube.com/trailer",
            review: "http://youtube.com/review"
        },
        screenshots: ["http://example.com/screen1.jpg"],
        changelog: [],
        localizations: []
    };

    console.log("Creating mod:", testSlug);

    let result;
    try {
        result = await createMod(testMod);
    } catch (e) {
        console.log("Caught error during createMod (likely revalidatePath):", e);
        result = { success: false, error: String(e) };
    }

    if (result.success) {
        console.log("Mod created successfully!");
    } else {
        console.log("Mod creation returned failure (or threw), checking DB anyway...");
    }

    // Verify it exists in DB
    const savedMod = await prisma.mod.findUnique({
        where: { slug: testSlug }
    });

    if (savedMod) {
        console.log("Verified: Mod found in database.");
        console.log("Slug:", savedMod.slug);
        console.log("Title:", savedMod.title);

        // Clean up
        console.log("Cleaning up...");
        await prisma.mod.delete({
            where: { slug: testSlug }
        });
        console.log("Test mod deleted.");
    } else {
        console.error("Error: Mod not found in database after creation attempt.");
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
