import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard'
import { RolesGuard } from './common/guards/roles.guard'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CommonModule } from './common/common.module'
import { LoggerModule } from './logger/logger.module'
import { RequestLoggerMiddleware } from './logger/request-logger.middleware'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/user/user.module'
import { CustomerModule } from './modules/customer/customer.module'
import { LeadModule } from './modules/lead/lead.module'
import { IntentionModule } from './modules/intention/intention.module'
import { EquipmentModule } from './modules/equipment/equipment.module'
import { TicketModule } from './modules/ticket/ticket.module'
import { TaskModule } from './modules/task/task.module'
import { SystemConfigModule } from './modules/system-config/system-config.module'
import { HealthModule } from './modules/health/health.module'
import { UploadModule } from './upload/upload.module'
import { SchedulerModule } from './scheduler/scheduler.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env'],
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'auth',
        ttl: 60000,
        limit: 10,
      },
    ]),
    LoggerModule,
    CommonModule,
    PrismaModule,
    RedisModule,
    SystemConfigModule,
    HealthModule,
    UploadModule,
    SchedulerModule,
    AuthModule,
    UserModule,
    CustomerModule,
    LeadModule,
    IntentionModule,
    EquipmentModule,
    TicketModule,
    TaskModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*')
  }
}
