import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'

const savedLocale = localStorage.getItem('xqcop_locale') || 'zh-CN'

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

export function setLocale(locale: 'zh-CN' | 'en-US') {
  i18n.global.locale.value = locale
  localStorage.setItem('xqcop_locale', locale)
}

export type Locale = 'zh-CN' | 'en-US'
