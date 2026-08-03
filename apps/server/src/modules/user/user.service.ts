import { Injectable, NotFoundException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '@/prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { page: number; pageSize: number; keyword?: string; departmentId?: string; status?: string }) {
    const { page, pageSize, keyword, departmentId, status } = params
    const where: Record<string, unknown> = {}
    if (keyword) {
      where.OR = [{ username: { contains: keyword } }, { name: { contains: keyword } }]
    }
    if (departmentId) where.departmentId = departmentId
    if (status) where.status = status

    const [list, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          name: true,
          phone: true,
          email: true,
          departmentId: true,
          roleIds: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ])

    return { list, total, page, pageSize }
  }

  async findDepartments() {
    const departments = await this.prisma.department.findMany({
      where: { deletedAt: null, status: 'ACTIVE' },
      orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, parentId: true, path: true, sortOrder: true },
    })
    return { list: departments }
  }

  async findRoles() {
    const roles = await this.prisma.role.findMany({
      where: { deletedAt: null, status: 'ACTIVE' },
      orderBy: [{ name: 'asc' }],
      select: { id: true, name: true, code: true },
    })
    return { list: roles }
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        email: true,
        departmentId: true,
        roleIds: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
    })
    if (!user) throw new NotFoundException('用户不存在')
    return user
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } })
  }

  async create(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10)
    return this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        email: true,
        status: true,
        createdAt: true,
      },
    })
  }

  async update(id: string, dto: UpdateUserDto) {
    const data: Record<string, unknown> = { ...dto }
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10)
    }
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        email: true,
        departmentId: true,
        roleIds: true,
        status: true,
        updatedAt: true,
      },
    })
  }

  async remove(id: string) {
    await this.prisma.user.delete({ where: { id } })
    return { success: true }
  }
}
