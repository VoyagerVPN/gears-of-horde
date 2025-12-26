import { neonConfig, Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@/generated/prisma'
import ws from 'ws'

// Setup WebSocket constructor for the Neon serverless driver (required for Node.js)
neonConfig.webSocketConstructor = ws

const connectionString = process.env.DATABASE_URL as string

if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment variables")
}

// Pass the connection string configuration directly to PrismaNeon
// This matches the expected PoolConfig interface for Prisma v7+ adapter
const adapter = new PrismaNeon({ connectionString })

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db =
    globalForPrisma.prisma || new PrismaClient({
        adapter,
        log: ['query', 'info', 'warn', 'error']
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
