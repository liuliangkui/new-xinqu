import { Module } from '@nestjs/common'
import { WorkbenchService } from './workbench.service'
import { WorkbenchController } from './workbench.controller'
import { PrismaModule } from '@/prisma/prisma.module'
import { CommonModule } from '@/common/common.module'

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [WorkbenchController],
  providers: [WorkbenchService],
  exports: [WorkbenchService],
})
export class WorkbenchModule {}
