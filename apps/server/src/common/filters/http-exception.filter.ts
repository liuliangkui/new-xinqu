import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { BusinessException } from '@/common/exceptions/business.exception'

export interface ErrorResponse {
  code: number | string
  data: null
  message: string
  success: false
  timestamp: string
  path: string
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as { message?: string | string[] }).message || '请求失败'

    const businessCode = exception instanceof BusinessException ? exception.code : String(status)

    const errorResponse: ErrorResponse = {
      code: businessCode,
      data: null,
      message: Array.isArray(message) ? message.join(', ') : message,
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
    }

    response.status(HttpStatus.OK).json(errorResponse)
  }
}
