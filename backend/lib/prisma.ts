// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
<<<<<<< HEAD
        log: ["query", "info", "warn", "error"],
    });
=======
    log: ["query"],
});
>>>>>>> aaa24fa6b2b65d5ed93d1ec26ecb25cf260bea40

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
