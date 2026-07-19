import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.profile.upsert({
    where: { userId: 'seed-user-1' },
    update: {},
    create: {
      userId: 'seed-user-1',
      displayName: 'Seed Admin',
    },
  })
}

main().finally(() => prisma.$disconnect())
