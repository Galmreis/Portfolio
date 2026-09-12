import { useEffect, useState } from 'react'

function remember(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* aba anônima: a escolha só não sobrevive */
  }
}

function ThemeToggle({ theme, flipTheme }) {
  const label = theme === 'dark' ? 'Mudar para o tema claro' : 'Mudar para o tema escuro'
  return (
    <button className="theme" type="button" onClick={flipTheme} aria-label={label} title={label}>
      --{theme}
    </button>
  )
}

export default function App() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function flipTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    remember('theme', next)
  }

  return (
    <>
      <ThemeToggle theme={theme} flipTheme={flipTheme} />
      <main>Reis — Portfolio</main>
    </>
  )
}
