import { useEffect, useState } from 'react'

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
