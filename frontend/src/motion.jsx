import { useEffect, useRef, useState } from 'react'


export const stillPlease = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// aqui toda palavra dentro do headline principal vai ganhar o efeito de movimento do treewalker.
function splitIntoWords(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const textNodes = []
  while (walker.nextNode()) textNodes.push(walker.currentNode)

  let index = 0
  for (const node of textNodes) {
    const fragment = document.createDocumentFragment()
    for (const piece of node.textContent.split(/(\s+)/)) {
      if (!piece) continue
      if (!piece.trim()) {
        fragment.appendChild(document.createTextNode(piece))
        continue
      }
      const clip = document.createElement('span')
      clip.className = 'word'
      const slide = document.createElement('span')
      slide.className = 'word-in'
      slide.textContent = piece
      slide.style.animationDelay = `${index * 60}ms`
      index += 1
      clip.appendChild(slide)
      fragment.appendChild(clip)
    }
    node.parentNode.replaceChild(fragment, node)
  }
}

export function Headline({ html }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    el.innerHTML = html
    if (!stillPlease()) splitIntoWords(el)
  }, [html])

  return <h1 className="hero-title" ref={ref} />
}

// o texto visível é aria-hidden e a frase inteira fica em um span só para
// leitor de tela. caso contrário ele anuncia cada palavra pela metade e quebra em alguns formatos.
export function TypeOut({ text, className, speed = 16, delay = 500 }) {
  const [shown, setShown] = useState('')

  useEffect(() => {
    if (stillPlease()) {
      setShown(text)
      return
    }
    setShown('')
    let i = 0
    let tick
    const start = setTimeout(() => {
      tick = setInterval(() => {
        i += 1
        setShown(text.slice(0, i))
        if (i >= text.length) clearInterval(tick)
      }, speed)
    }, delay)
    return () => {
      clearTimeout(start)
      clearInterval(tick)
    }
  }, [text, speed, delay])

  const done = shown.length === text.length

  return (
    <p className={`type ${className}`}>
      <span className="sr-only">{text}</span>
      <span className="type-ghost" aria-hidden="true">{text}</span>
      <span className="type-live" aria-hidden="true">
        {shown}
        {!done && <i className="caret" />}
      </span>
    </p>
  )
}

// --scroll é escrito aqui e o CSS usa em calc() pra dar um leve parallax.
export function useParallax() {
  useEffect(() => {
    if (stillPlease()) return
    let ticking = false
    const update = () => {
      document.documentElement.style.setProperty('--scroll', `${scrollY}`)
      ticking = false
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }
    update()
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [])
}


export function useActiveSection(ids) {
  const [active, setActive] = useState('')

  useEffect(() => {
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (!sections.length) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    sections.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ids])

  return active
}

export function useReveal(deps) {
  useEffect(() => {
    const targets = [...document.querySelectorAll('[data-reveal]:not(.is-in)')]
    if (!targets.length) return

    if (stillPlease()) {
      targets.forEach((el) => el.classList.add('is-in'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          io.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
    )
    targets.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, deps)
}

const JUNK = '!<>-_\\/[]{}—=+*^?#________'
// função scramble, onde gera o efeito inicial de letras embaralhadas no menu e nos título de seção.

export function Scramble({ text, className, as: Tag = 'span', onHover = false }) {
  const [shown, setShown] = useState(text)
  const frame = useRef(0)
  const raf = useRef(0)

  function run() {
    if (stillPlease()) return
    cancelAnimationFrame(raf.current)
    frame.current = 0

    const step = () => {
      frame.current += 1
      const settled = Math.floor(frame.current / 2.2)
      let out = ''
      for (let i = 0; i < text.length; i += 1) {
        if (text[i] === ' ') out += ' '
        else if (i < settled) out += text[i]
        else out += JUNK[Math.floor(Math.random() * JUNK.length)]
      }
      setShown(out)
      if (settled <= text.length) raf.current = requestAnimationFrame(step)
      else setShown(text)
    }
    raf.current = requestAnimationFrame(step)
  }

  useEffect(() => {
    setShown(text)
    run()
    return () => cancelAnimationFrame(raf.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  return (
    <Tag className={className} onMouseEnter={onHover ? run : undefined}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{shown}</span>
    </Tag>
  )
}


// notas pois essa foi difícil:
// no css renderiza um cursor none, já que estou usando um personalizado
// essa função renderiza dois elementos por cima da página, sincronizando e trackeado a posição do mouse do usuário na página.
export function Cursor() {
  useEffect(() => {
    if (stillPlease() || !window.matchMedia('(pointer: fine)').matches) return

    const dot = document.createElement('div')
    const ring = document.createElement('div')
    dot.className = 'cursor-dot'
    ring.className = 'cursor-ring'
    document.body.append(dot, ring)
    document.body.classList.add('has-cursor')

    // centraliza o nosso "ponteiro" inicial no centro da página, pra não começar com undefined e só reage no primeiro movimento do mouse do usuário
    let x = innerWidth / 2
    let y = innerHeight / 2
    let rx = x
    let ry = y
    let scale = 1
    let wantScale = 1
    let spin = 0
    let wantSpin = 0
    let raf = 0
    const onMove = (e) => {
      x = e.clientX
      y = e.clientY
      const el = e.target instanceof Element ? e.target : null
      const hot = el?.closest('a, button, .project, .stack-block, .contacts > div')
      wantScale = hot ? 1.8 : 1
      wantSpin = hot ? 45 : 0
    }


    const onLeave = () => { dot.style.opacity = ring.style.opacity = '0' }
    const onEnter = () => { dot.style.opacity = ring.style.opacity = '1' }

    // aqui entra o delay do anel ao redor do cursor. onde entra a parte da transição suave que tem do cursor quando ele passa por cima de algo clicável ou navega na página
    //junto da sincronização dos dois elementos acontece. pegando o x e y (vertical e horizontal do mouse) e trackeando aqui, usando as variaveis x, y, rx e ry que foram definidas mais pra cima.
    const loop = () => {
      rx += (x - rx) * 0.18
      ry += (y - ry) * 0.18
      scale += (wantScale - scale) * 0.2
      spin += (wantSpin - spin) * 0.2

      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
      ring.style.transform =
        `translate(${rx}px, ${ry}px) translate(-50%, -50%) rotate(${spin}deg) scale(${scale})`
      ring.classList.toggle('is-hot', wantScale > 1)

      raf = requestAnimationFrame(loop)
    }

    addEventListener('pointermove', onMove)
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('pointerenter', onEnter)
    raf = requestAnimationFrame(loop)

    return () => {
      removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('pointerenter', onEnter)
      cancelAnimationFrame(raf)
      dot.remove()
      ring.remove()
      document.body.classList.remove('has-cursor')
    }
  }, [])

  return null
}

// escreve um número de 0 a 1 numa variável CSS e deixa o CSS desenhar a
// barra de progresso.
export function useScrollProgress() {
  useEffect(() => {
    const el = document.documentElement
    let ticking = false

    const update = () => {
      const max = el.scrollHeight - innerHeight
      el.style.setProperty('--progress', max > 0 ? el.scrollTop / max : 0)
      ticking = false
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    update()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onScroll)
    }
  }, [])
}
