import { Module } from '@nestjs/common'
import { CalendarService } from './calendar.service'
import { CalendarController } from './calendar.controller'
import { PrismaModule } from '@/prisma/prisma.module'
import { CommonModule } from '@/common/common.module'

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
