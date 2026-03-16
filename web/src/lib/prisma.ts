import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

/**
 * Prisma 7 Best Practice: Using a driver adapter for PostgreSQL.
 * This resolves the "Unknown property datasources" error.
 */
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

console.log('--- INITIALIZING PRISMA CLIENT WITH ADAPTER ---');

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ 
    adapter,
    log: ['error', 'warn'] 
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
