import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton Setup
 * In Next.js development mode, hot-reloading can create multiple PrismaClient instances,
 * exhausting database connection pools. Storing it in `global` prevents multiple instances.
 */

// Access NodeJS global scope
const globalForPrisma = global;

// Initialize Prisma client or reuse the existing singleton instance
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // Enable SQL query logging for debugging
  });

// Save client instance to global object in non-production environments
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
