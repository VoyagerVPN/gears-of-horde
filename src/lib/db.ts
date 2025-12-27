import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@/generated/prisma'
import ws from 'ws'

// Setup WebSocket constructor for the Neon serverless driver (required for Node.js)
if (!neonConfig.webSocketConstructor) {
    neonConfig.webSocketConstructor = ws
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment variables")
}

// Initialize Prisma with the Neon adapter
const adapter = new PrismaNeon({ connectionString })

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db =
    globalForPrisma.prisma || new PrismaClient({
        adapter,
        log: ['error']
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
