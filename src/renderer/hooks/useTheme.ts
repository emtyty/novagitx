import { useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'novagitx-theme'

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
}

function resolveMode(mode: ThemeMode, systemDark: boolean): boolean {
  if (mode === 'dark') return true
  if (mode === 'light') return false
  return systemDark
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(
    () => (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? 'system'
  )
  const [systemDark, setSystemDark] = useState(false)

  useEffect(() => {
    window.theme.getTheme().then(({ shouldUseDarkColors }) => {
      setSystemDark(shouldUseDarkColors)
      applyTheme(resolveMode(mode, shouldUseDarkColors))
    })

    const unsubscribe = window.theme.onThemeChanged((dark) => {
      setSystemDark(dark)
      setModeState((current) => {
        applyTheme(resolveMode(current, dark))
        return current
      })
    })

    return unsubscribe
  }, [])

  function setMode(next: ThemeMode) {
    localStorage.setItem(STORAGE_KEY, next)
    setModeState(next)
    applyTheme(resolveMode(next, systemDark))
    window.theme.setThemeSource(next)
  }

  const isDark = resolveMode(mode, systemDark)

  return { mode, isDark, setMode }
}
