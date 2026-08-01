import { Injectable, NestMiddleware, Logger } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP')

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now()
    const { method, originalUrl, ip } = req

    res.on('finish', () => {
      const duration = Date.now() - start
      const message = `${method} ${originalUrl} ${res.statusCode} - ${duration}ms - ${ip}`

      if (res.statusCode >= 500) {
        this.logger.error(message)
      } else if (res.statusCode >= 400) {
        this.logger.warn(message)
      } else {
        this.logger.log(message)
      }
    })

    next()
  }
}
