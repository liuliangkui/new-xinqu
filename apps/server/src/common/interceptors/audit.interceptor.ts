import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { Request } from 'express'

export interface AuditLogData {
  userId?: string
  username?: string
  action: string
  resource: string
  resourceId?: string
  method: string
  path: string
  ip: string
  payload?: Record<string, unknown>
  statusCode: number
  duration: number
  createdAt: Date
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>()
    const start = Date.now()
    const user = (request as Request & { user?: { userId: string; username: string } }).user

    return next.handle().pipe(
      tap({
        next: () => {
          this.log(request, start, 200, user)
        },
        error: (error) => {
          this.log(request, start, error.status || 500, user)
        },
      }),
    )
  }

  private log(request: Request, start: number, statusCode: number, user?: { userId: string; username: string }) {
    const duration = Date.now() - start
    const method = request.method
    const path = request.path
    const action = this.inferAction(method)
    const resource = this.inferResource(path)

    const logData: AuditLogData = {
      userId: user?.userId,
      username: user?.username,
      action,
      resource,
      method,
      path,
      ip: request.ip || '',
      statusCode,
      duration,
      createdAt: new Date(),
    }

    // 先输出到日志，后续可持久化到数据库
    console.log('[AUDIT]', JSON.stringify(logData))
  }

  private inferAction(method: string): string {
    const map: Record<string, string> = {
      GET: 'READ',
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    }
    return map[method] || method
  }

  private inferResource(path: string): string {
    const segments = path.replace('/api/v1/', '').split('/')
    return segments[0] || 'unknown'
  }
}
