import 'dotenv/config';
import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

const sql = readFileSync(join(process.cwd(), 'prisma', 'init-cloud-db.sql'), 'utf-8');

pool.query(sql)
    .then(() => {
        console.log('✅ SUCCESS! All tables created in cloud database.');
        pool.end();
    })
    .catch((e: { message: string }) => {
        console.error('❌ Error:', e.message);
        pool.end();
        process.exit(1);
    });
