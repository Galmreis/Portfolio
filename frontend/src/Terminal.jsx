import { useState, useRef, useEffect, useCallback } from 'react'
import { site, stack, projects, contacts, nav, ui, terminal, machine, timeline, build } from './content.js'
import { art, artNames, animations } from './ascii.js'
import { stillPlease } from './motion.jsx'

// Um estado guarda a lista do que já aconteceu (`lines`), outro guarda o
// que a pessoa está digitando (`value`). Comando nenhum desenha nada: ele
// devolve linhas e o React desenha. Por isso dá para testar os comandos sem
// navegador e nenhum deles toca no DOM.
// Cada linha é um objeto com `kind`, e o renderizador faz switch nisso.

// Troca {cmd} / {arg} numa string do content.js. Manter o placeholder na
// frase deixa cada idioma pôr o valor onde a gramática dele pede.
const fill = (template, values) =>
  Object.entries(values).reduce((out, [k, v]) => out.replaceAll(`{${k}}`, v), template)

// Atalhos para montar linha de saída.
const out = (text) => ({ kind: 'out', text })
const dim = (text) => ({ kind: 'dim', text })
const table = (rows) => ({ kind: 'table', rows })
// Para o comando, animado e parado são a mesma coisa: desenha o que
// existir com aquele nome.
const drawing = (name) => ({ kind: animations[name] ? 'anim' : 'art', name })

// Um comando é (args, context) -> array de linhas. O `context` leva o
// idioma e os dicionários, mais os dois efeitos colaterais que um terminal
// pode ter: limpar a si mesmo e rolar a página. Esses dois entram pelo
// context em vez de serem chamados direto, para o teste passar falsos.

const commands = {
  help: (args, { t }) => [
    dim(t.helpTitle),
    table(t.help),
  ],

  // De propósito não é o site.intro: aquele parágrafo já está sendo
  // digitado na coluna ao lado, e repetir deixava o hero dizendo a mesma
  // coisa duas vezes. Aqui sai o que é verdade agora, lido da timeline.
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

  // `nav` é a lista de ids das seções, então isso nunca desencontra da
  // página de verdade.
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

// Nomes que alguém pode digitar querendo a mesma coisa.
const aliases = { cat: 'whoami', about: 'whoami', dir: 'ls', quit: 'exit', man: 'help', '?': 'help' }

// Exportado para poder ser testado sem renderizar nada.
export function run(input, context) {
  const [raw, ...args] = input.trim().split(/\s+/)
  const name = aliases[raw.toLowerCase()] || raw.toLowerCase()
  const command = commands[name]
  if (!command) return [out(fill(context.t.notFound, { cmd: raw }))]
  return command(args, context)
}

// Sozinho, o terminal digita isso para quem nunca clica ver que ele é
// vivo. São comandos, não texto, então não traduz. Para de vez no primeiro
// sinal de gente de verdade e nunca disputa o teclado.
const DEMO_SCRIPT = ['art rain', 'whoami', 'projects']

const DEMO = {
  wait: 900,    // antes da primeira tecla
  key: 55,      // entre caracteres
  beforeEnter: 420,
  read: 2600,   // quanto tempo a resposta fica antes do próximo comando
}

// Componente próprio para os re-renders baterem em um <pre> só, e não no
// log inteiro: 14fps redesenhando toda linha acima seria desperdício.
function AnimatedArt({ name }) {
  const { fps, frame } = animations[name]
  const [step, setStep] = useState(0)

  useEffect(() => {
    // Com movimento reduzido o desenho ainda aparece, só parado no
    // primeiro quadro.
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

// ---------- o componente ----------

export default function Terminal({ lang }) {
  const t = terminal[lang]
  const [lines, setLines] = useState([])
  const [value, setValue] = useState('')
  // Histórico, mais novo por último, andado com as setas. `cursor` é -1
  // quando você está digitando algo novo em vez de navegando.
  const [history, setHistory] = useState([])
  const [cursor, setCursor] = useState(-1)

  const logRef = useRef(null)
  const inputRef = useRef(null)

  const prompt = `${site.brand.toLowerCase()}@portfolio:~$`

  // O boot roda de novo na troca de idioma, e por isso reseta o log
  // inteiro em vez de acrescentar: meia tela em inglês e meia em português
  // seria pior que recomeçar. Ele termina rodando `neofetch` sozinho, para
  // o quadro nunca ser uma caixa vazia esperando ser descoberta.
  //
  // `follow` diz se o log acompanha a saída para baixo. Só o exec() liga
  // isso, então o boot é a única coisa que não se rola para fora da vista
  // antes de alguém ler.
  const follow = useRef(false)

  useEffect(() => {
    follow.current = false
    setLines([
      ...t.boot.map((line) => dim(fill(line, { build }))),
      ...run('neofetch', { t, lang }),
    ])
  }, [t, lang])

  // Só esse elemento rola. A página nunca, senão o leitor é arrastado.
  useEffect(() => {
    const log = logRef.current
    if (!log || !follow.current) return
    log.scrollTop = log.scrollHeight
  }, [lines])

  // Submit de verdade e demo passam os dois por aqui, então existe uma
  // definição só do que um comando faz e o demo não desencontra.
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

      // Primeiro o eco do comando, depois o que ele devolveu. O `clear`
      // esvazia o log dentro do run(), então o eco precisa vir depois:
      // um setLines com os dois, não duas chamadas.
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

  // `stopped` é ref, não state: o loop rodando precisa ver o valor novo na
  // hora, e um setState não chegaria na closure em que ele já está.
  const stopped = useRef(false)
  const [demoOn, setDemoOn] = useState(false)

  // Chamado no primeiro clique, tecla ou foco de verdade. Idempotente de
  // propósito, porque dispara de três eventos diferentes.
  const stopDemo = useCallback(() => {
    if (stopped.current) return
    stopped.current = true
    setDemoOn(false)
    setValue('')   // joga fora o que o demo estava digitando pela metade
  }, [])

  useEffect(() => {
    // Digitar sozinho é decoração. Quem pediu movimento reduzido recebe o
    // terminal parado no prompt.
    if (stillPlease() || stopped.current) return

    // Cada execução do efeito tem a própria flag: o StrictMode monta duas
    // vezes em dev e os dois loops digitariam um por cima do outro.
    let cancelled = false
    const timers = []
    const sleep = (ms) => new Promise((done) => timers.push(setTimeout(done, ms)))
    const alive = () => !cancelled && !stopped.current

    async function play() {
      setDemoOn(true)
      await sleep(DEMO.wait)

      for (const [index, command] of DEMO_SCRIPT.entries()) {
        if (!alive()) return

        // Limpa entre comandos para cada resposta aparecer inteira. Shell
        // de verdade não faria isso, mas aqui a graça é ver a saída toda.
        if (index > 0) setLines([])

        for (let i = 1; i <= command.length; i += 1) {
          if (!alive()) return
          setValue(command.slice(0, i))
          await sleep(DEMO.key)
        }

        await sleep(DEMO.beforeEnter)
        if (!alive()) return
        setValue('')
        // record: false, porque os comandos do demo não são de quem visita
        // e não podem cair no histórico das setas.
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

  // As setas andam no histórico, como num shell de verdade.
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
    // Clicar em qualquer lugar do quadro foca o input, que é o que clicar
    // num terminal faz. O <form> continua sendo o controle de verdade.
    <div
      className="term"
      onClick={() => inputRef.current?.focus()}
      // Fase de captura, para o demo parar antes da tecla chegar no input
      // e os dois brigarem pelo valor.
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

// Um switch, um caso por tipo de linha. Tipo novo de saída é um caso aqui
// mais um atalho lá em cima.
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

    // O logo do Arch ao lado das linhas, como o neofetch faz. Dois
    // elementos num flex, para tela estreita empilhar em vez de entortar
    // o desenho.
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
