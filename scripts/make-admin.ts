
import { readFileSync } from 'fs';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma';
import path from 'path';

// Load .env manually
try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envFile = readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^"(.*)"$/, '$1'); // Remove quotes
            process.env[key] = value;
        }
    });
} catch (e) {
    console.log('Could not load .env file, assuming env vars are set.');
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.log('Available users:');
        const users = await prisma.user.findMany({
            select: { email: true, name: true, role: true },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        console.table(users);
        console.log('\nUsage: npx tsx scripts/make-admin.ts <email>');
        return;
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.error(`User with email "${email}" not found.`);
        return;
    }

    const updated = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
    });

    console.log(`\nSuccess! User ${updated.email} is now an ${updated.role}.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
