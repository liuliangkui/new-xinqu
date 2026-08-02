import { Module } from '@nestjs/common'
import { ReagentService } from './reagent.service'
import { ReagentController } from './reagent.controller'
import { PrismaModule } from '@/prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [ReagentController],
  providers: [ReagentService],
  exports: [ReagentService],
})
export class ReagentModule {}
