import { Module } from '@nestjs/common'
import { IntentionService } from './intention.service'
import { IntentionController } from './intention.controller'
import { PrismaModule } from '@/prisma/prisma.module'
import { CommonModule } from '@/common/common.module'

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [IntentionController],
  providers: [IntentionService],
  exports: [IntentionService],
})
export class IntentionModule {}
