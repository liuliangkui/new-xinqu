import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { AppController } from './app.controller'
import { PrismaModule } from '@/prisma/prisma.module'
import { CommonModule } from '@/common/common.module'

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppCenterModule {}
