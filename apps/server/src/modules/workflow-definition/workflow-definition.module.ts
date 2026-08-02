import { Module } from '@nestjs/common'
import { WorkflowDefinitionService } from './workflow-definition.service'
import { WorkflowDefinitionController } from './workflow-definition.controller'
import { PrismaModule } from '@/prisma/prisma.module'
import { FlowableModule } from '@/modules/flowable/flowable.module'

@Module({
  imports: [PrismaModule, FlowableModule],
  controllers: [WorkflowDefinitionController],
  providers: [WorkflowDefinitionService],
  exports: [WorkflowDefinitionService],
})
export class WorkflowDefinitionModule {}
