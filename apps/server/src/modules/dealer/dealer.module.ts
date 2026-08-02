import { Module } from '@nestjs/common'
import { DealerService } from './dealer.service'
import { DealerController } from './dealer.controller'
import { PrismaModule } from '@/prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [DealerController],
  providers: [DealerService],
  exports: [DealerService],
})
export class DealerModule {}
