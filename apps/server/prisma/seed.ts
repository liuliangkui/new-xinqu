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

const departments = [
  { id: 'dept_sales', name: '销售部', path: '/dept_sales', sortOrder: 1 },
  { id: 'dept_marketing', name: '市场部', path: '/dept_marketing', sortOrder: 2 },
  { id: 'dept_service', name: '售后服务部', path: '/dept_service', sortOrder: 3 },
  { id: 'dept_east', name: '华东大区', path: '/dept_east', sortOrder: 4 },
  { id: 'dept_north', name: '华北大区', path: '/dept_north', sortOrder: 5 },
]

const regions = [
  { id: 'region_north', code: 'NORTH', name: '华北', path: '/NORTH', level: 1 },
  { id: 'region_east', code: 'EAST', name: '华东', path: '/EAST', level: 1 },
  { id: 'region_south', code: 'SOUTH', name: '华南', path: '/SOUTH', level: 1 },
  { id: 'region_central', code: 'CENTRAL', name: '华中', path: '/CENTRAL', level: 1 },
  { id: 'region_southwest', code: 'SOUTHWEST', name: '西南', path: '/SOUTHWEST', level: 1 },
  { id: 'region_northwest', code: 'NORTHWEST', name: '西北', path: '/NORTHWEST', level: 1 },
  { id: 'region_northeast', code: 'NORTHEAST', name: '东北', path: '/NORTHEAST', level: 1 },
]

const apps = [
  {
    code: 'workbench',
    name: '工作台',
    category: 'PLATFORM',
    route: '/',
    permissions: ['workbench:read'],
    sortOrder: 1,
  },
  {
    code: 'calendar',
    name: '日历',
    category: 'PLATFORM',
    route: '/calendar',
    permissions: ['calendar:read'],
    sortOrder: 2,
  },
  { code: 'tasks', name: '任务', category: 'PLATFORM', route: '/tasks', permissions: ['task:read'], sortOrder: 3 },
  {
    code: 'message',
    name: '消息中心',
    category: 'PLATFORM',
    route: '/message',
    permissions: ['message:read'],
    sortOrder: 4,
  },
  {
    code: 'contacts',
    name: '通讯录',
    category: 'PLATFORM',
    route: '/contacts',
    permissions: ['contact:read'],
    sortOrder: 5,
  },
  {
    code: 'favorites',
    name: '收藏夹',
    category: 'PLATFORM',
    route: '/favorites',
    permissions: ['favorite:read'],
    sortOrder: 6,
  },
  { code: 'apps', name: '应用中心', category: 'PLATFORM', route: '/apps', permissions: ['app:read'], sortOrder: 7 },
  {
    code: 'customer',
    name: '客户 360°',
    category: 'BUSINESS',
    route: '/customer',
    permissions: ['customer:read'],
    sortOrder: 10,
  },
  { code: 'lead', name: '线索管理', category: 'BUSINESS', route: '/lead', permissions: ['lead:read'], sortOrder: 11 },
  {
    code: 'intention',
    name: '意向管理',
    category: 'BUSINESS',
    route: '/intention',
    permissions: ['intention:read'],
    sortOrder: 12,
  },
  {
    code: 'brand',
    name: '品牌库管理',
    category: 'BUSINESS',
    route: '/brand',
    permissions: ['brand:read'],
    sortOrder: 13,
  },
  {
    code: 'equipment',
    name: '设备管理',
    category: 'BUSINESS',
    route: '/equipment',
    permissions: ['equipment:read'],
    sortOrder: 14,
  },
  {
    code: 'reagent',
    name: '试剂运营',
    category: 'BUSINESS',
    route: '/reagent',
    permissions: ['reagent:read'],
    sortOrder: 15,
  },
  {
    code: 'approval',
    name: '审批中心',
    category: 'PROCESS',
    route: '/approval',
    permissions: ['approval:read'],
    sortOrder: 20,
  },
  {
    code: 'ticket',
    name: '售后工单',
    category: 'PROCESS',
    route: '/ticket',
    permissions: ['ticket:read'],
    sortOrder: 21,
  },
  {
    code: 'kanban',
    name: '工单看板',
    category: 'PROCESS',
    route: '/kanban',
    permissions: ['ticket:read'],
    sortOrder: 22,
  },
  {
    code: 'dealer',
    name: '经销商协同',
    category: 'PROCESS',
    route: '/dealer',
    permissions: ['dealer:read'],
    sortOrder: 23,
  },
  {
    code: 'designer',
    name: '流程设计器',
    category: 'PROCESS',
    route: '/designer',
    permissions: ['workflow:read'],
    sortOrder: 24,
  },
  {
    code: 'compliance',
    name: '合规风控',
    category: 'ANALYSIS',
    route: '/compliance',
    permissions: ['compliance:read'],
    sortOrder: 30,
  },
  {
    code: 'performance',
    name: '目标绩效',
    category: 'ANALYSIS',
    route: '/performance',
    permissions: ['performance:read'],
    sortOrder: 31,
  },
  {
    code: 'dashboard',
    name: '经营驾驶舱',
    category: 'ANALYSIS',
    route: '/dashboard',
    permissions: ['dashboard:read'],
    sortOrder: 32,
  },
  {
    code: 'config',
    name: '应用配置',
    category: 'SYSTEM',
    route: '/config',
    permissions: ['config:read'],
    sortOrder: 40,
  },
  {
    code: 'settings',
    name: '后台设置',
    category: 'SYSTEM',
    route: '/settings',
    permissions: ['system:read'],
    sortOrder: 41,
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

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { id: dept.id },
      update: dept,
      create: dept,
    })
  }

  for (const region of regions) {
    await prisma.region.upsert({
      where: { code: region.code },
      update: region,
      create: { ...region, id: region.id },
    })
  }

  for (const app of apps) {
    await prisma.app.upsert({
      where: { code: app.code },
      update: app,
      create: app,
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
      departmentId: 'dept_sales',
      roleIds: ['role_super_admin'],
      status: 'ACTIVE',
    },
  })

   
  console.log('Seed completed: roles, departments, regions, apps and default admin created.')
}

main()
  .catch((e) => {
     
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
