import { Module } from '@nestjs/common'
import { WorkflowDefinitionService } from './workflow-definition.service'
import { WorkflowDefinitionController } from './workflow-definition.controller'
import { PrismaModule } from '@/prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [WorkflowDefinitionController],
  providers: [WorkflowDefinitionService],
  exports: [WorkflowDefinitionService],
})
export class WorkflowDefinitionModule {}
