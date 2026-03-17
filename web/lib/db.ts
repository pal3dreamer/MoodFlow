import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/lib/env";

declare global {
  // eslint-disable-next-line no-var
  var __moodflow_prisma__: PrismaClient | undefined;
}

function createPrismaClient() {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is required before using Prisma.");
  }

  const adapter = new PrismaPg({ connectionString: env.databaseUrl });

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    adapter,
  });
}

function getPrismaClient() {
  if (!global.__moodflow_prisma__) {
    global.__moodflow_prisma__ = createPrismaClient();
  }

  return global.__moodflow_prisma__;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client as object, property, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
