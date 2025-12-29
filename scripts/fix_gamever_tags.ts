/**
 * One-time script to fix game version tag displayNames
 * 
 * This script normalizes all gamever tags to ensure consistent formatting:
 * - Alpha versions: A20, A21 (not VA20, VA21)
 * - V versions: V1.0, V2.1 (not VV1.0)
 * - N/A stays as N/A
 * 
 * Run with: npx tsx scripts/fix_gamever_tags.ts
 */

import fs from 'fs';
import path from 'path';

// 1. Load env vars BEFORE importing db
const loadEnv = () => {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf-8');
            envConfig.split('\n').forEach(line => {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                    if (!process.env[key.trim()]) {
                        process.env[key.trim()] = value;
                    }
                }
            });
            console.log("✅ Loaded environment variables from .env");
        }
    } catch (e) {
        console.warn("⚠️ Could not load .env file:", e);
    }
};

loadEnv();

function normalizeGameVersion(version: string): string {
    if (!version) return version;

    const trimmed = version.trim();

    // N/A is special case - keep as-is
    if (trimmed.toUpperCase() === 'N/A') return 'N/A';

    // First, strip any leading V if followed by A (handles VA21 -> A21)
    let cleaned = trimmed;
    if (cleaned.match(/^[vV][aA]\d+/)) {
        cleaned = cleaned.substring(1); // Remove the V, keep the A
    }

    // Alpha versions (A20, a21, etc.)
    if (cleaned.match(/^[aA]\d+/)) {
        return cleaned.toUpperCase();
    }

    // V versions (with or without build number)
    // Remove any existing V/v prefix, then add uppercase V
    cleaned = cleaned.replace(/^[vV]/, '');
    return `V${cleaned}`;
}

// 2. Dynamic imports after env is loaded
const main = async () => {
    const { db: prisma } = await import("../src/lib/db");

    console.log('🔄 Fixing game version tag displayNames...\n');

    // Get all gamever tags
    const gameVerTags = await prisma.tag.findMany({
        where: { category: 'gamever' }
    });

    console.log(`Found ${gameVerTags.length} game version tags\n`);

    let fixedCount = 0;

    for (const tag of gameVerTags) {
        const normalized = normalizeGameVersion(tag.displayName);

        if (normalized !== tag.displayName) {
            console.log(`  ❌ "${tag.displayName}" -> ✅ "${normalized}"`);

            await prisma.tag.update({
                where: { id: tag.id },
                data: { displayName: normalized }
            });

            fixedCount++;
        } else {
            console.log(`  ✓ "${tag.displayName}" (already correct)`);
        }
    }

    console.log(`\n✅ Fixed ${fixedCount} out of ${gameVerTags.length} tags`);
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    });
