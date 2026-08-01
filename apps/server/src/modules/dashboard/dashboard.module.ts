import { Module } from '@nestjs/common'
import { DashboardService } from './dashboard.service'
import { DashboardController } from './dashboard.controller'
import { PrismaModule } from '@/prisma/prisma.module'
import { CommonModule } from '@/common/common.module'

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
