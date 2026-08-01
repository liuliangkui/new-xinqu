import { Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { UploadService, UploadedFileResult } from './upload.service'
import type { MulterFile } from './upload.types'

@Controller('files')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: new UploadService().getStorage(),
    }),
  )
  uploadFile(@UploadedFile() file: MulterFile): UploadedFileResult {
    this.uploadService.validateFile(file)
    return this.uploadService.buildResult(file)
  }

  @Post('uploads')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: new UploadService().getStorage(),
    }),
  )
  uploadFiles(@UploadedFiles() files: MulterFile[]): UploadedFileResult[] {
    return files.map((file) => {
      this.uploadService.validateFile(file)
      return this.uploadService.buildResult(file)
    })
  }
}
