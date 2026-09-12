import { useState, useEffect } from 'react'
import { site, nav, ui, languages } from './content.js'
import { useActiveSection } from './motion.jsx'

function remember(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* aba anônima: a escolha só não sobrevive */
  }
}

function recall(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function LanguageToggle({ lang, setLang, t }) {
  return (
    <div className="lang" role="group" aria-label={t.langLabel}>
      {languages.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

function ThemeToggle({ theme, flipTheme, t }) {
  const label = theme === 'dark' ? t.themeToLight : t.themeToDark
  return (
    <button className="theme" type="button" onClick={flipTheme} aria-label={label} title={label}>
      --{theme}
    </button>
  )
}

function Nav({ lang, setLang, theme, flipTheme, t }) {
  const active = useActiveSection(nav)

  return (
    <nav className="nav">
      <a className="nav-brand" href="#top">{site.brand}</a>
      <ul className="nav-links">
        {nav.map((id) => (
          <li key={id}>
            <a href={`#${id}`} aria-current={active === id ? 'location' : undefined}>
              {t[id]}
            </a>
          </li>
        ))}
      </ul>
      <ThemeToggle theme={theme} flipTheme={flipTheme} t={t} />
      <LanguageToggle lang={lang} setLang={setLang} t={t} />
    </nav>
  )
}

export default function App() {
  const [lang, setLang] = useState(() => {
    const saved = recall('lang')
    if (languages.includes(saved)) return saved
    return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en'
  })

  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark')

  useEffect(() => {
    remember('lang', lang)
    document.documentElement.lang = lang
    document.title = ui[lang].title
  }, [lang])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function flipTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    remember('theme', next)
  }

  const t = ui[lang]

  return (
    <>
      <Nav lang={lang} setLang={setLang} theme={theme} flipTheme={flipTheme} t={t} />
      <main id="top">{site[lang].intro}</main>
    </>
  )
}
