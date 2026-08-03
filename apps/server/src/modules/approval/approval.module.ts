import { Module } from '@nestjs/common'
import { ApprovalService } from './approval.service'
import { ApprovalController } from './approval.controller'
import { PrismaModule } from '@/prisma/prisma.module'
import { CommonModule } from '@/common/common.module'
import { FlowableModule } from '@/modules/flowable/flowable.module'

@Module({
  imports: [PrismaModule, CommonModule, FlowableModule],
  controllers: [ApprovalController],
  providers: [ApprovalService],
  exports: [ApprovalService],
})
export class ApprovalModule {}
