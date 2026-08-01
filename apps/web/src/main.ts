import '@/styles/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'

import App from './App.vue'
import router from './router'
import { installXqComponents } from '@/components/xq'
import { initTheme } from '@/utils/theme'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Antd)
app.use({ install: installXqComponents })

initTheme()

app.mount('#app')
