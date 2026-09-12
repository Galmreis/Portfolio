import { useState, useRef, useEffect, useCallback } from 'react'
import { site, stack, projects, contacts, nav, ui, terminal, machine, timeline, build } from './content.js'
import { art, artNames, animations } from './ascii.js'
import { stillPlease } from './motion.jsx'


const fill = (template, values) =>
  Object.entries(values).reduce((out, [k, v]) => out.replaceAll(`{${k}}`, v), template)


const out = (text) => ({ kind: 'out', text })
const dim = (text) => ({ kind: 'dim', text })
const table = (rows) => ({ kind: 'table', rows })

const drawing = (name) => ({ kind: animations[name] ? 'anim' : 'art', name })

const commands = {
  help: (args, { t }) => [
    dim(t.helpTitle),
    table(t.help),
  ],


  whoami: (args, { t, lang }) => [
    out(`${site.name} — ${t.role}`),
    table([
      ...timeline
        .filter((entry) => entry.current)
        .map((entry) => [t.labels.now, `${entry[lang].title} @ ${entry[lang].where}`]),
      [t.labels.location, site[lang].location],
    ]),
  ],

  neofetch: (args, { t, lang }) => [
    {
      kind: 'fetch',
      rows: [
        [t.labels.role, t.role],
        [t.labels.location, site[lang].location],
        [t.labels.os, machine.os],
        [t.labels.wm, machine.wm],
        [t.labels.shell, machine.shell],
        [t.labels.editor, machine.editor],
        // stack[0] é "uso hoje", stack[1] é "aprendendo", ver content.js
        [t.labels.using, stack[0].items.join(' ')],
        [t.labels.learning, stack[1].items.join(' ')],
      ],
    },
  ],


  ls: (args, { lang }) => [
    out(nav.map((id) => `${id}/`).join('   ')),
    dim(nav.map((id) => ui[lang][id]).join('   ')),
  ],

  cd: (args, { t, go }) => {
    const target = (args[0] || '').replace(/\/$/, '').toLowerCase()
    if (!target) return [out(t.needsArg)]
    if (!nav.includes(target)) return [out(fill(t.noSection, { arg: target }))]
    go(target)
    return [dim(fill(t.jumping, { arg: `${target}/` }))]
  },

  stack: (args, { lang }) =>
    stack.flatMap((block) => [
      dim(`${block[lang].group}/`),
      out(block.items.map((i) => `  ${i}`).join('\n')),
    ]),

  projects: (args, { lang }) => [
    table(projects.map((p) => [`~/${p[lang].name}`, p.year])),
  ],

  contact: () => [table(contacts.map((c) => [c.key, c.value]))],

  art: (args, { t }) => {
    const name = (args[0] || '').toLowerCase()
    if (!name) return artNames.map(drawing)
    if (!art[name] && !animations[name]) return [out(fill(t.noArt, { arg: name }))]
    return [drawing(name)]
  },

  clear: (args, { clear }) => {
    clear()
    return []
  },

  sudo: (args, { t }) => [out(t.sudo)],
  exit: (args, { t }) => [out(t.exit)],
}

// comandos que alguém pode digitar querendo a mesma coisa.
const aliases = { cat: 'whoami', about: 'whoami', dir: 'ls', quit: 'exit', man: 'help', '?': 'help' }

export function run(input, context) {
  const [raw, ...args] = input.trim().split(/\s+/)
  const name = aliases[raw.toLowerCase()] || raw.toLowerCase()
  const command = commands[name]
  if (!command) return [out(fill(context.t.notFound, { cmd: raw }))]
  return command(args, context)
}


const DEMO_SCRIPT = ['art rain', 'whoami', 'projects']

// tempo de duração da demo se o usuário não digitar nada.
const DEMO = {
  wait: 900,    // antes da primeira tecla
  key: 55,      // entre caracteres
  beforeEnter: 420,
  read: 2600,   // quanto tempo a resposta fica antes do próximo comando
}

function AnimatedArt({ name }) {
  const { fps, frame } = animations[name]
  const [step, setStep] = useState(0)

  useEffect(() => {

    if (stillPlease()) return
    const id = setInterval(() => setStep((n) => n + 1), 1000 / fps)
    return () => clearInterval(id)
  }, [fps])

  return (
    <pre className="term-art is-live" aria-label={name}>
      {frame(step).join('\n')}
    </pre>
  )
}

// ---------- o componente do terminal em si ----------

export default function Terminal({ lang }) {
  const t = terminal[lang]
  const [lines, setLines] = useState([])
  const [value, setValue] = useState('')
  // aqui é onde fica a lógica do histórico.
  const [history, setHistory] = useState([])
  const [cursor, setCursor] = useState(-1)

  const logRef = useRef(null)
  const inputRef = useRef(null)

  const prompt = `${site.brand.toLowerCase()}@portfolio:~$`

  const follow = useRef(false)

  useEffect(() => {
    follow.current = false
    setLines([
      ...t.boot.map((line) => dim(fill(line, { build }))),
      ...run('neofetch', { t, lang }),
    ])
  }, [t, lang])

  useEffect(() => {
    const log = logRef.current
    if (!log || !follow.current) return
    log.scrollTop = log.scrollHeight
  }, [lines])


  const exec = useCallback(
    (input, { record = true } = {}) => {
      if (!input) return

      if (record) {
        setHistory((h) => [...h, input])
        setCursor(-1)
      }

      // O que for digitado é acompanhado para baixo, ver `follow` acima.
      follow.current = true

      const context = {
        t,
        lang,
        clear: () => setLines([]),
        go: (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }),
      }


      const produced = run(input, context)
      setLines((prev) => {
        const base = input.trim().toLowerCase() === 'clear' ? [] : prev
        return [...base, { kind: 'in', text: input }, ...produced]
      })
    },
    [t, lang],
  )

  const submit = useCallback(
    (event) => {
      event.preventDefault()
      const input = value.trim()
      setValue('')
      exec(input)
    },
    [value, exec],
  )


  const stopped = useRef(false)
  const [demoOn, setDemoOn] = useState(false)

  const stopDemo = useCallback(() => {
    if (stopped.current) return
    stopped.current = true
    setDemoOn(false)
    setValue('')
  }, [])

  useEffect(() => {

    if (stillPlease() || stopped.current) return

    let cancelled = false
    const timers = []
    const sleep = (ms) => new Promise((done) => timers.push(setTimeout(done, ms)))
    const alive = () => !cancelled && !stopped.current

    async function play() {
      setDemoOn(true)
      await sleep(DEMO.wait)

      for (const [index, command] of DEMO_SCRIPT.entries()) {
        if (!alive()) return

        if (index > 0) setLines([])

        for (let i = 1; i <= command.length; i += 1) {
          if (!alive()) return
          setValue(command.slice(0, i))
          await sleep(DEMO.key)
        }

        await sleep(DEMO.beforeEnter)
        if (!alive()) return
        setValue('')
        exec(command, { record: false })
        await sleep(DEMO.read)
      }

      if (!alive()) return
      setLines((prev) => [...prev, dim(t.demoDone)])
      setDemoOn(false)
    }

    play()
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [t, exec])

  // config de histórico, igual um terminal mesmo.
  function onKeyDown(event) {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    if (!history.length) return
    event.preventDefault()

    const next =
      event.key === 'ArrowUp'
        ? Math.min(cursor + 1, history.length - 1)
        : Math.max(cursor - 1, -1)

    setCursor(next)
    setValue(next === -1 ? '' : history[history.length - 1 - next])
  }

  return (
    // foca no terminal quando clicado, pra não ser mais um elemento estático dentro da página.
    <div
      className="term"
      onClick={() => inputRef.current?.focus()}

      onPointerDownCapture={stopDemo}
      onKeyDownCapture={stopDemo}
      onFocusCapture={stopDemo}
    >
      <div className="term-bar" aria-hidden="true">
        <span className="term-dots"><i /><i /><i /></span>
        <span className="term-title">{prompt}</span>
        {demoOn && <span className="term-demo">{t.demo}</span>}
      </div>

      {/* role="log" + aria-live: o leitor de tela anuncia a saída nova
          conforme ela chega, em vez de ficar mudo. */}
      <div className="term-log" ref={logRef} role="log" aria-live="polite">
        {lines.map((line, i) => (
          <Line key={i} line={line} prompt={prompt} />
        ))}

        <form className="term-input" onSubmit={submit}>
          <label className="sr-only" htmlFor="term-field">{t.label}</label>
          <span className="prompt" aria-hidden="true">{prompt}</span>
          <input
            id="term-field"
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={demoOn ? '' : t.hint}
            autoComplete="off"
            spellCheck="false"
            aria-describedby="term-hint"
          />
        </form>
        <p id="term-hint" className="sr-only">{t.hint}</p>
      </div>
    </div>
  )
}

function Line({ line, prompt }) {
  switch (line.kind) {
    case 'in':
      return (
        <p className="term-line">
          <span className="prompt">{prompt}</span> {line.text}
        </p>
      )

    case 'dim':
      return <p className="term-line is-dim">{line.text}</p>

    case 'table':
      return (
        <dl className="term-table">
          {line.rows.map(([key, val]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{val}</dd>
            </div>
          ))}
        </dl>
      )

    case 'art':
      return <pre className="term-art" aria-label={line.name}>{art[line.name].join('\n')}</pre>

    case 'anim':
      return <AnimatedArt name={line.name} />

//renderiza os elementos dentro de um display flex pra não quebrar a arte ascii
    case 'fetch':
      return (
        <div className="term-fetch">
          <pre className="term-art" aria-label="Arch Linux">{art.arch.join('\n')}</pre>
          <dl className="term-table">
            {line.rows.map(([key, val]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{val}</dd>
              </div>
            ))}
          </dl>
        </div>
      )

    default:
      return <p className="term-line">{line.text}</p>
  }
}