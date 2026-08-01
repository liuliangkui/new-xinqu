export const UPLOAD_CONFIG = {
  destination: process.env['UPLOAD_DIR'] || 'uploads',
  maxFileSize: Number(process.env['UPLOAD_MAX_SIZE'] || 10) * 1024 * 1024, // 默认 10MB
  allowedMimeTypes: (
    process.env['UPLOAD_ALLOWED_TYPES'] ||
    'image/jpeg,image/png,image/gif,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ).split(','),
  baseUrl: process.env['UPLOAD_BASE_URL'] || '',
}
