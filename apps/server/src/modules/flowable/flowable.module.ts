import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { FlowableService } from './flowable.service'

@Module({
  imports: [HttpModule],
  providers: [FlowableService],
  exports: [FlowableService],
})
export class FlowableModule {}
