import { PrismaClient } from '@/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment variables")
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db =
    globalForPrisma.prisma || (() => {
        // For local Postgres we use the standard pg pool
        const pool = new pg.Pool({
            connectionString,
        })

        const adapter = new PrismaPg(pool)

        return new PrismaClient({
            adapter,
            log: ['error']
        })
    })()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
