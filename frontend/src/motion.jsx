import { useEffect, useRef, useState } from 'react'

// Lido toda vez em vez de cacheado, porque a pessoa pode mudar a
// configuração com a aba aberta.
export const stillPlease = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// O headline é HTML por causa do <em>, então não dá para quebrar com um
// .map. Isso percorre os nós de texto e embrulha cada palavra em dois
// spans: o de fora corta, o de dentro sobe.
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

// O texto visível é aria-hidden e a frase inteira fica em um span só para
// leitor de tela. Senão ele anuncia cada palavra pela metade.
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

  // Três camadas no mesmo parágrafo: a frase inteira para leitor de tela,
  // uma cópia invisível que dá a altura ao parágrafo, e o texto crescendo
  // por cima da invisível.
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


// Devolve o id da seção que está cruzando o meio da tela. O rootMargin
// encolhe a área observada para uma faixa central: a seção só conta como
// atual quando é o que você está lendo, não quando o primeiro pixel dela
// aparece.
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
