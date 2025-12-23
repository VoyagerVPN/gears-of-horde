import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';

// Use the unpooled URL for direct database access
const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
}

console.log('🔗 Connecting to:', connectionString.replace(/:[^:@]+@/, ':****@'));

const pool = new Pool({ connectionString });

// Read SQL file
const schemaSql = readFileSync(join(process.cwd(), 'prisma', 'init-cloud-db.sql'), 'utf-8');

async function main() {
    console.log('🔄 Creating tables in Neon database...');

    try {
        const client = await pool.connect();
        console.log('✅ Connected to database');

        await client.query(schemaSql);
        console.log('✅ SUCCESS! All tables created.');

        // Verify tables were created
        const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
        console.log('📋 Created tables:', tables.rows.map(r => r.table_name));

        client.release();
        await pool.end();
    } catch (error: unknown) {
        const e = error as { message?: string };
        console.error('❌ Error:', e.message || error);
        await pool.end();
        process.exit(1);
    }
}

main();
