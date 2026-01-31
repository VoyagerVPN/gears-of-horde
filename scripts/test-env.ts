import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'Not Found');
