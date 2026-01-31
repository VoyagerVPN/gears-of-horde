import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Manual .env parser for standalone script execution
const loadEnv = (fileName) => {
    const envPath = path.resolve(process.cwd(), fileName);
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf-8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
                process.env[key] = value;
            }
        });
    }
};

loadEnv('.env');
loadEnv('.env.development.local');

const rawConnectionString = process.env.DATABASE_URL_UNPOOLED;

if (!rawConnectionString) {
    console.error("DATABASE_URL_UNPOOLED not set");
    process.exit(1);
}

// Strip SSL params from URL to avoid conflicts with config object
const url = new URL(rawConnectionString);
url.searchParams.delete('sslmode');
url.searchParams.delete('ssl');
const connectionString = url.toString();

const client = new pg.Client({
    connectionString,
    ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1') 
        ? false 
        : { rejectUnauthorized: false }
});

async function testConnection() {
    try {
        await client.connect();
        const res = await client.query('SELECT NOW()');
        console.log('Connection successful:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('Connection failed:', err);
        process.exit(1);
    }
}

testConnection();
