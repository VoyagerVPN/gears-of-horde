import 'dotenv/config';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\'')
    .then((r) => {
        console.log('Tables in database:', r.rows);
        pool.end();
    })
    .catch((e: { message: string }) => {
        console.error('Error:', e.message);
        pool.end();
    });
