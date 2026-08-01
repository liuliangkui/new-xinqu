import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const roles = [
  {
    id: 'role_super_admin',
    name: '超级管理员',
    code: 'super_admin',
    dataScope: 'ALL',
    permissions: [{ resource: '*', action: '*' }],
  },
  {
    id: 'role_sales',
    name: '销售代表',
    code: 'sales',
    dataScope: 'SELF',
    permissions: [
      { resource: 'customer', action: 'read' },
      { resource: 'customer', action: 'create' },
      { resource: 'customer', action: 'update' },
      { resource: 'lead', action: 'read' },
      { resource: 'lead', action: 'create' },
      { resource: 'lead', action: 'update' },
      { resource: 'intention', action: 'read' },
      { resource: 'intention', action: 'create' },
      { resource: 'intention', action: 'update' },
      { resource: 'dashboard', action: 'read' },
      { resource: 'workbench', action: 'read' },
    ],
  },
  {
    id: 'role_region_manager',
    name: '区域经理',
    code: 'region_manager',
    dataScope: 'REGION',
    permissions: [
      { resource: 'customer', action: 'read' },
      { resource: 'customer', action: 'create' },
      { resource: 'customer', action: 'update' },
      { resource: 'lead', action: 'read' },
      { resource: 'lead', action: 'create' },
      { resource: 'lead', action: 'update' },
      { resource: 'intention', action: 'read' },
      { resource: 'intention', action: 'create' },
      { resource: 'intention', action: 'update' },
      { resource: 'performance', action: 'read' },
      { resource: 'dashboard', action: 'read' },
      { resource: 'workbench', action: 'read' },
    ],
  },
  {
    id: 'role_viewer',
    name: '只读用户',
    code: 'viewer',
    dataScope: 'DEPT',
    permissions: [
      { resource: 'customer', action: 'read' },
      { resource: 'lead', action: 'read' },
      { resource: 'intention', action: 'read' },
      { resource: 'dashboard', action: 'read' },
      { resource: 'workbench', action: 'read' },
    ],
  },
]

async function main() {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {
        name: role.name,
        dataScope: role.dataScope,
        permissions: role.permissions,
      },
      create: {
        id: role.id,
        name: role.name,
        code: role.code,
        dataScope: role.dataScope,
        permissions: role.permissions,
      },
    })
  }

  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      id: 'user_admin',
      username: 'admin',
      password: adminPassword,
      name: '系统管理员',
      roleIds: ['role_super_admin'],
      status: 'ACTIVE',
    },
  })

   
  console.log('Seed completed: roles and default admin created.')
}

main()
  .catch((e) => {
     
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
