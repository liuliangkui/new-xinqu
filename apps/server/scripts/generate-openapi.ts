import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { NestExpressApplication, ExpressAdapter } from '@nestjs/platform-express'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { AppModule } from '../src/app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter())

  const config = new DocumentBuilder()
    .setTitle('XQCOP API')
    .setDescription('鑫渠业务协同运营平台 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  const outputPath = resolve(process.cwd(), 'openapi.json')
  writeFileSync(outputPath, JSON.stringify(document, null, 2))

   
  console.log(`OpenAPI JSON generated: ${outputPath}`)
  await app.close()
}

bootstrap().catch((error) => {
   
  console.error(error)
  process.exit(1)
})
