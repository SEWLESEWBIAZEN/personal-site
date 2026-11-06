import { PrismaClient } from "@prisma/client";

// Cached on globalThis in every environment: in dev it survives hot reloads,
// and in production it stops Next's separate bundle layers (route handlers vs.
// Server Components/Actions) from each opening their own connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();
globalForPrisma.prisma = prisma;
