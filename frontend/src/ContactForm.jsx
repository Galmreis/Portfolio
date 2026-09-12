import { useState } from 'react'
import { site } from './content.js'

// Validação vem do próprio navegador, via `required` e `type="email"`.
// Sem biblioteca de formulário.

export default function ContactForm({ t }) {
  // 'idle' | 'sending' | 'sent' | 'failed'
  const [status, setStatus] = useState('idle')

  async function submit(event) {
    event.preventDefault() // segura o reload padrão do navegador
    setStatus('sending')

    // FormData lê pelo atributo `name`, então não precisa de um useState
    // por input.
    const data = Object.fromEntries(new FormData(event.target))

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error(response.status)
      event.target.reset()
      setStatus('sent')
    } catch {
      setStatus('failed')
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <h3>{t.formTitle}</h3>

      <label>
        {t.name}
        <input name="name" type="text" required minLength={2} maxLength={80} />
      </label>

      <label>
        {t.email}
        <input name="email" type="email" required maxLength={120} />
      </label>

      <label>
        {t.message}
        <textarea name="message" rows={4} required minLength={10} maxLength={2000} />
      </label>

      <button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? t.sending : t.send}
      </button>

      {/* aria-live avisa o leitor de tela quando esse texto muda, e
          data-status deixa o CSS escolher cor e símbolo. Falha sempre
          termina em um e-mail que funciona: o formulário é conveniência,
          e não pode ser o único jeito de me achar. */}
      <p className="form-status" data-status={status} role="status" aria-live="polite">
        {status === 'sent' && t.sent}
        {status === 'failed' && (
          <>
            {t.failed}{' '}
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </>
        )}
      </p>
    </form>
  )
}
