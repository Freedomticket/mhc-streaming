// Optional Prisma client loader to avoid breaking dev when engines/client aren't generated
// Falls back gracefully so pages can render with static content/fallbacks.
let PrismaClient: any
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PrismaClient = require('@prisma/client').PrismaClient
} catch {
  PrismaClient = null
}

const globalForPrisma = global as unknown as { prisma: any }

export const prisma: any = PrismaClient
  ? (globalForPrisma.prisma ?? new PrismaClient({ log: ['error', 'warn'] }))
  : new Proxy(
      {},
      {
        get() {
          throw new Error('PRISMA_UNAVAILABLE')
        },
      }
    )

if (process.env.NODE_ENV !== 'production' && PrismaClient) globalForPrisma.prisma = prisma
