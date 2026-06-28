import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

if (
  typeof process !== "undefined" &&
  process.env &&
  !process.env.DATABASE_URL
) {
  try {
    import("dotenv").then(({ config }) => config({ path: ".env" }));
  } catch {
    // dotenv not available (Edge Runtime), Next.js auto-loads .env
  }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
