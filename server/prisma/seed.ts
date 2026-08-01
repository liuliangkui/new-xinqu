import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10)

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      name: '系统管理员',
      phone: '13800138000',
      email: 'admin@xqcop.com',
      status: 'ACTIVE',
    },
  })

  console.log('Seed completed: admin user created.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
