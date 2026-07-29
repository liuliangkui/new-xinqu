const THEME_KEY = 'xinqu-theme'

type Theme = 'light' | 'dark'

export function getSavedTheme(): Theme | null {
  if (typeof window === 'undefined') return null
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'dark' || saved === 'light') return saved
  return null
}

export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getTheme(): Theme {
  return getSavedTheme() || getSystemTheme()
}

export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem(THEME_KEY, theme)
}

export function toggleTheme(): Theme {
  const current = getTheme()
  const next = current === 'light' ? 'dark' : 'light'
  setTheme(next)
  return next
}

export function initTheme(): void {
  if (typeof window === 'undefined') return
  setTheme(getTheme())

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    if (!getSavedTheme()) {
      setTheme(e.matches ? 'dark' : 'light')
    }
  })
}
