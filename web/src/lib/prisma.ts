import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Prisma 7+ constructor types can be tricky during build-time evaluation
const prismaOptions: any = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(prismaOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
