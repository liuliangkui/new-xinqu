import { Module, Global } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core'
import { TransformInterceptor } from './interceptors/transform.interceptor'
import { AuditInterceptor } from './interceptors/audit.interceptor'
import { HttpExceptionFilter } from './filters/http-exception.filter'
import { DataScopeHelper } from './helpers/data-scope.helper'

@Global()
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    DataScopeHelper,
  ],
  exports: [DataScopeHelper],
})
export class CommonModule {}
