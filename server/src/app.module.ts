import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { EventEmitterModule } from '@nestjs/event-emitter'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CommonModule } from './common/common.module'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/user/user.module'
import { CustomerModule } from './modules/customer/customer.module'
import { LeadModule } from './modules/lead/lead.module'
import { SystemConfigModule } from './modules/system-config/system-config.module'
import { HealthModule } from './modules/health/health.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env'],
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    CommonModule,
    PrismaModule,
    RedisModule,
    SystemConfigModule,
    HealthModule,
    AuthModule,
    UserModule,
    CustomerModule,
    LeadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
