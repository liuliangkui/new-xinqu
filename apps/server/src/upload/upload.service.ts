import { BadRequestException, Injectable } from '@nestjs/common'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { mkdirSync } from 'fs'
import { randomUUID } from 'crypto'
import { UPLOAD_CONFIG } from './upload.config'
import type { MulterFile } from './upload.types'

export interface UploadedFileResult {
  originalName: string
  filename: string
  url: string
  size: number
  mimetype: string
}

@Injectable()
export class UploadService {
  constructor() {
    mkdirSync(UPLOAD_CONFIG.destination, { recursive: true })
  }

  getStorage() {
    return diskStorage({
      destination: UPLOAD_CONFIG.destination,
      filename: (_req, file, cb) => {
        const suffix = extname(file.originalname)
        cb(null, `${randomUUID().replace(/-/g, '')}${suffix}`)
      },
    })
  }

  validateFile(file: MulterFile): void {
    if (!file) {
      throw new BadRequestException('未选择文件')
    }
    if (file.size > UPLOAD_CONFIG.maxFileSize) {
      throw new BadRequestException(`文件大小不能超过 ${UPLOAD_CONFIG.maxFileSize / 1024 / 1024}MB`)
    }
    if (!UPLOAD_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`不支持的文件类型: ${file.mimetype}`)
    }
  }

  buildResult(file: MulterFile): UploadedFileResult {
    const url = UPLOAD_CONFIG.baseUrl ? `${UPLOAD_CONFIG.baseUrl}/${file.filename}` : `/uploads/${file.filename}`

    return {
      originalName: file.originalname,
      filename: file.filename,
      url,
      size: file.size,
      mimetype: file.mimetype,
    }
  }
}
