import { useState, useEffect } from 'react'
import { site, nav, ui, languages, stack, projects, timeline, contacts } from './content.js'
import { coverFor } from './ascii.js'
import { useActiveSection, Headline, TypeOut, useParallax, useReveal, useScrollProgress, Scramble, Cursor } from './motion.jsx'
import Terminal from './Terminal.jsx'
import ContactForm from './ContactForm.jsx'

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

function Hero({ lang }) {
  const s = site[lang]
  return (
    <header className="hero" id="top">
      <div className="hero-words">
        <p className="hero-cmd" aria-hidden="true">
          <span className="prompt">{site.brand.toLowerCase()}@portfolio</span>
          <span className="path">:~</span>
          <span className="prompt">$</span> whoami
        </p>
        <Headline html={s.headline} />
        <TypeOut className="hero-sub" text={s.intro} />
        <p className="hero-meta">
          <span>{s.location}</span>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
      </div>

      <Terminal lang={lang} />
    </header>
  )
}

// header de seção: número + nome, usado pelas quatro.
function Title({ number, children }) {
  return (
    <h2 className="section-title">
      <span className="section-num">{number}</span>
      <span className="prompt" aria-hidden="true">$</span>
      <Scramble text={children} onHover />
    </h2>
  )
}

function Stack({ lang, t }) {
  return (
    <section id="stack" className="section">
      <Title number="01">{t.stack}</Title>
      <div className="stack-grid">
        {stack.map((block, i) => (
          <div key={block[lang].group} className="stack-block" data-reveal style={{ '--d': i }}>
            <h3>{block[lang].group}</h3>
            <ul>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function ProjectCover({ project, name }) {
  if (project.image) {
    return <img className="project-shot" src={project.image} alt="" loading="lazy" />
  }
  return (
    <pre className="project-cover" aria-hidden="true">{coverFor(name).join('\n')}</pre>
  )
}

function Projects({ lang, t }) {
  return (
    <section id="projects" className="section">
      <Title number="02">{t.projects}</Title>
      <ul className="projects">
        {projects.map((project, i) => {
          const p = project[lang]
          return (
            <li key={p.name} className="project" data-reveal style={{ '--d': i }}>
              <div className="project-head">
                <h3>{p.name}</h3>
                <span className="project-year">{project.year}</span>
              </div>

              <div className="project-body">
                <ProjectCover project={project} name={p.name} />

                <div className="project-text">
                  <p>{p.summary}</p>
                  <p className="project-learned">
                    <span className="project-label">{t.learned}</span>
                    {p.learned}
                  </p>
                </div>
              </div>

              <div className="project-foot">
                <ul className="tags">
                  {project.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                {project.link && (
                  <a href={project.link}>{t.live} <span className="arrow">→</span></a>
                )}
                {project.repo && (
                  <a href={project.repo}>{t.code} <span className="arrow">→</span></a>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Timeline({ lang, t }) {
  return (
    <section id="timeline" className="section">
      <Title number="03">{t.timeline}</Title>
      <ol className="timeline">
        {timeline.map((entry, i) => (
          <li key={entry.id} data-reveal style={{ '--d': i }}>
            <span className="step-period">{entry[lang].period}</span>
            <div className="step-body">
              <h3>{entry[lang].title}</h3>
              <span className="step-where">{entry[lang].where}</span>
              <p>{entry[lang].text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Contact({ t }) {
  return (
    <section id="contact" className="section">
      <Title number="04">{t.contact}</Title>
      <div className="contact-grid">
        <dl className="contacts" data-reveal>
          {contacts.map((c) => (
            <div key={c.key}>
              <dt>{t[c.key] || c.key}</dt>
              <dd>
                <a href={c.href}>{c.value}</a>
              </dd>
            </div>
          ))}
        </dl>
        <div data-reveal style={{ '--d': 1 }}>
          <ContactForm t={t} />
        </div>
      </div>
    </section>
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
              <Scramble text={t[id]} />
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

  useParallax()
  useScrollProgress()
  useReveal([lang])

  const t = ui[lang]

  return (
    <>
      <a className="skip" href="#top">{t.skip}</a>
      <div className="progress" aria-hidden="true" />
      <Cursor />
      <Nav lang={lang} setLang={setLang} theme={theme} flipTheme={flipTheme} t={t} />
      <main>
        <Hero lang={lang} />
        <Stack lang={lang} t={t} />
        <Projects lang={lang} t={t} />
        <Timeline lang={lang} t={t} />
        <Contact t={t} />
      </main>
      <footer className="footer">
        <p>{site.name} — {t.footer}</p>
      </footer>
    </>
  )
}
