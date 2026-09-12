// Backend do formulário de contato. Uma rota, zero dependências:
// tudo que ele usa já vem dentro do Node.

import { createServer } from 'node:http'
import { appendFile } from 'node:fs/promises'

const PORT = process.env.PORT || 3000

const FILE = process.env.MESSAGES_FILE || 'messages.jsonl'

// Em dev o Vite faz proxy do /api, então CORS nem aparece. Isso aqui é para produção.
const ORIGINS = (process.env.ORIGINS || 'http://localhost:5173').split(',')

function validate(body) {
  const errors = []

  // JSON.parse aceita null e array, e os dois quebram body.name.
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { errors: ['body must be a JSON object'] }
  }

  const text = (value) => (typeof value === 'string' ? value.trim() : '')
  const name = text(body.name)
  const email = text(body.email)
  const message = text(body.message)

  if (name.length < 2 || name.length > 80) errors.push('name: between 2 and 80 characters')
  // Checa formato, não existência. Regex maior recusa endereço válido
  // e mesmo assim não prova que a caixa existe.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
    errors.push('email: invalid format')
  }
  if (message.length < 10 || message.length > 2000) {
    errors.push('message: between 10 and 2000 characters')
  }

  return { errors, data: { name, email, message } }
}

/** Lê o corpo da requisição, abortando acima de 10 KB. */
async function readBody(req) {
  // Sem setEncoding, um caractere multibyte (á, ç, ã) partido entre dois
  // chunks vira lixo.
  req.setEncoding('utf8')
  let raw = ''
  for await (const chunk of req) {
    raw += chunk
    // O limite vem antes do parse: corpo infinito derruba o processo.
    if (raw.length > 10_000) throw new Error('body too large')
  }
  return JSON.parse(raw || 'null') // quem chama trata o throw
}

function corsHeaders(origin) {
  // Nunca '*': isso liberaria qualquer site a chamar essa API pelo
  // navegador do visitante.
  if (!origin || !ORIGINS.includes(origin)) return {}
  return {
    'Access-Control-Allow-Origin': origin,
    Vary: 'Origin', // a resposta muda conforme a origem
  }
}

function respond(res, status, body, origin) {
  const headers = corsHeaders(origin)
  // 204 não pode ter corpo nem Content-Type.
  if (status === 204) {
    res.writeHead(204, headers)
    return res.end()
  }
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers })
  res.end(JSON.stringify(body))
}

// Exceção dentro de função async vira promise rejeitada, e rejeição não
// tratada derruba o processo inteiro no Node.
export const server = createServer(async (req, res) => {
  try {
    await handle(req, res)
  } catch (error) {
    // O detalhe fica no log do servidor.
    console.error('error handling request:', error)
    // Resposta genérica: mensagem interna revela caminho de arquivo.
    if (!res.headersSent) {
      respond(res, 500, { error: 'internal error' }, req.headers.origin)
    } else {
      res.end() // headers já enviados, só dá para fechar
    }
  }
})

async function handle(req, res) {
  const origin = req.headers.origin
  const route = `${req.method} ${req.url}`

  // Preflight: antes de um POST cross-origin o navegador pergunta quais
  // métodos e headers são aceitos. Sem os dois abaixo o POST nem sai.
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      ...corsHeaders(origin),
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400', // cacheia o preflight por um dia
    })
    return res.end()
  }

  // Primeiro lugar para checar quando alguma coisa não funciona.
  if (route === 'GET /api/health') {
    return respond(res, 200, { ok: true }, origin)
  }

  if (route === 'POST /api/contact') {
    let body
    try {
      body = await readBody(req)
    } catch {
      return respond(res, 400, { error: 'invalid JSON or body too large' }, origin)
    }

    const { errors, data } = validate(body)
    if (errors.length) return respond(res, 422, { errors }, origin)

    const record = { ...data, at: new Date().toISOString() }
    // appendFile abre no fim do arquivo: uma linha JSON por mensagem.
    await appendFile(FILE, JSON.stringify(record) + '\n', 'utf8')

    return respond(res, 201, { ok: true }, origin)
  }

  respond(res, 404, { error: 'route not found' }, origin)
}

// Só sobe o servidor quando rodado direto; o teste importa e escolhe a porta.
if (process.argv[1]?.endsWith('server.js')) {
  server.listen(PORT, () => {
    console.log(`backend on http://127.0.0.1:${PORT}`)
  })
}
