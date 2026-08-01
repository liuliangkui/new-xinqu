import { Prisma } from '@prisma/client'

const modelsWithSoftDelete = [
  'systemConfig',
  'systemConfigHistory',
  'auditLog',
  'fileAttachment',
  'department',
  'region',
  'user',
  'role',
  'userSetting',
  'app',
  'userFavorite',
  'message',
  'notificationSetting',
  'customer',
  'contact',
  'customerDepartment',
  'visitRecord',
  'lead',
  'leadFollowRecord',
  'intention',
  'intentionStageRecord',
  'brand',
  'product',
  'equipment',
  'reagentBatch',
  'task',
  'taskComment',
  'schedule',
  'scheduleReminder',
  'approvalTemplate',
  'approvalInstance',
  'approvalTask',
  'approvalCcRecord',
  'ticket',
  'ticketComment',
  'dealer',
  'dealerContract',
  'dealerOrder',
  'dealerInventory',
  'workflowDefinition',
  'workflowInstance',
  'complianceRule',
  'complianceRecord',
  'complianceEvidence',
  'performanceTarget',
  'performanceActual',
  'dashboardConfig',
] as const

type SoftDeleteModel = (typeof modelsWithSoftDelete)[number]

function withDeletedFilter(args: Record<string, unknown> | undefined) {
  if (!args) {
    return { where: { deletedAt: null } }
  }
  const { withDeleted, ...rest } = args
  if (withDeleted === true) {
    return rest
  }
  return {
    ...rest,
    where: {
      ...(rest.where as Record<string, unknown> | undefined),
      deletedAt: null,
    },
  }
}

function buildModelExtension(model: SoftDeleteModel, base: unknown) {
  const delegate = (base as Record<string, Record<string, (args: unknown) => unknown>>)[model]

  return {
    findMany(args?: Record<string, unknown>) {
      return delegate.findMany(withDeletedFilter(args))
    },
    findFirst(args?: Record<string, unknown>) {
      return delegate.findFirst(withDeletedFilter(args))
    },
    findFirstOrThrow(args?: Record<string, unknown>) {
      return delegate.findFirstOrThrow(withDeletedFilter(args))
    },
    findUnique(args: { where: Record<string, unknown> }) {
      return delegate.findFirst({
        where: {
          AND: [args.where, { deletedAt: null }],
        },
      })
    },
    findUniqueOrThrow(args: { where: Record<string, unknown> }) {
      return delegate.findFirstOrThrow({
        where: {
          AND: [args.where, { deletedAt: null }],
        },
      })
    },
    count(args?: Record<string, unknown>) {
      return delegate.count(withDeletedFilter(args))
    },
    aggregate(args?: Record<string, unknown>) {
      return delegate.aggregate(withDeletedFilter(args))
    },
    groupBy(args?: Record<string, unknown>) {
      return delegate.groupBy(withDeletedFilter(args))
    },
    softDelete(where: Record<string, unknown>) {
      return delegate.update({ where, data: { deletedAt: new Date() } })
    },
    restore(where: Record<string, unknown>) {
      return delegate.update({ where, data: { deletedAt: null } })
    },
  }
}

export const softDeleteExtension = Prisma.defineExtension((client) => {
  const base = client as unknown
  const modelExtensions: Record<string, unknown> = {}

  for (const model of modelsWithSoftDelete) {
    modelExtensions[model] = buildModelExtension(model, base)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (client.$extends as any)({
    model: modelExtensions,
  })
})
