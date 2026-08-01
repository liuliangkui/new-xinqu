import '@/styles/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'

import App from './App.vue'
import router from './router'
import { i18n } from '@/i18n'
import { installXqComponents } from '@/components/xq'
import { initTheme } from '@/utils/theme'
import { useAuthStore } from '@/stores/auth'

async function bootstrap() {
  if (import.meta.env.VITE_ENABLE_MOCK === 'true') {
    const { worker } = await import('@/mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }

  const app = createApp(App)

  app.use(createPinia())

  const authStore = useAuthStore()
  await authStore.init()

  app.use(router)
  app.use(i18n)
  app.use(Antd)
  app.use({ install: installXqComponents })

  initTheme()

  app.mount('#app')
}

bootstrap()
