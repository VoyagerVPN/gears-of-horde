import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@/generated/prisma'
import ws from 'ws'

// Setup WebSocket constructor for the Neon serverless driver
neonConfig.webSocketConstructor = ws

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaNeon({ connectionString })

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db =
    globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
