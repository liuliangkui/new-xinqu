import { NestFactory } from '@nestjs/core'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import helmet from 'helmet'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  // 全局前缀
  app.setGlobalPrefix('api')

  // API 版本控制
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })

  // 全局参数校验
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )

  // 安全头
  app.use(helmet())

  // CORS
  const corsOrigin = configService.get('CORS_ORIGIN', '')
  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',') : ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  // Swagger 文档
  const swaggerConfig = new DocumentBuilder()
    .setTitle('XQCOP API')
    .setDescription('鑫渠业务协同运营平台 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api/docs', app, document)

  const port = configService.get('PORT', 3000)
  await app.listen(port)

  console.log(`Application is running on: http://localhost:${port}/api`)
  console.log(`Swagger docs: http://localhost:${port}/api/docs`)
}

bootstrap()
