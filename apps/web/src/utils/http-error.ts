import { message } from 'ant-design-vue'

let messageInstance: ReturnType<typeof message.error> | null = null

export function showError(msg: string): void {
  if (messageInstance) {
    message.destroy()
  }
  messageInstance = message.error(msg)
}

export function handleHttpError(error: unknown): void {
  if (error instanceof Error) {
    showError(error.message || '请求失败，请稍后重试')
    return
  }
  showError('请求失败，请稍后重试')
}
