// Roda com: npm test

import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, rm, chmod } from 'node:fs/promises'

// Aponta o arquivo de teste ANTES de importar o server.js, que lê essa
// variável na importação. Ao contrário, o teste escreveria no
// messages.jsonl de verdade.
const FILE = 'messages.test.jsonl'
process.env.MESSAGES_FILE = FILE

const { server } = await import('./server.js')

let url
const valid = { name: 'Reis', email: 'reis@example.com', message: 'Hey, how are you?' }

// Porta 0 = qualquer porta livre, para o teste não quebrar quando o dev
// server já está no 3000.
before(async () => {
  await rm(FILE, { force: true })
  await new Promise((ok) => server.listen(0, ok))
  url = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  server.close()
  await rm(FILE, { force: true })
})

const send = (body) =>
  fetch(`${url}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

const lines = async () =>
  (await readFile(FILE, 'utf8')).trim().split('\n').filter(Boolean)

test('accepts a valid message and stores it', async () => {
  assert.equal((await send(valid)).status, 201)
  const [first] = await lines()
  assert.equal(JSON.parse(first).name, 'Reis')
})

test('appends: does not erase the previous message', async () => {
  await send(valid)
  assert.equal((await lines()).length, 2)
})

test('rejects invalid input with 422 and stores nothing', async () => {
  assert.equal((await send({ ...valid, email: 'not-an-email' })).status, 422)
  assert.equal((await send({ ...valid, message: 'short' })).status, 422)
  assert.equal((await send({ name: 'R' })).status, 422)
  assert.equal((await send(null)).status, 422)
  assert.equal((await send([1, 2])).status, 422)
  assert.equal((await lines()).length, 2)
})

test('rejects malformed JSON with 400', async () => {
  const res = await fetch(`${url}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{not json',
  })
  assert.equal(res.status, 400)
})

test('keeps multi-byte characters intact', async () => {
  await send({ ...valid, message: 'Olá, coração, não, ação — açúcar.' })
  const last = JSON.parse((await lines()).at(-1))
  assert.equal(last.message, 'Olá, coração, não, ação — açúcar.')
})

test('preflight allows the method AND the header', async () => {
  const res = await fetch(`${url}/api/contact`, {
    method: 'OPTIONS',
    headers: { Origin: 'http://localhost:5173' },
  })
  assert.equal(res.status, 204)
  assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:5173')
  // Sem esses dois o preflight falha e o POST nem sai.
  assert.match(res.headers.get('access-control-allow-methods'), /POST/)
  assert.match(res.headers.get('access-control-allow-headers'), /Content-Type/i)
  // 204 não pode ter corpo.
  assert.equal(await res.text(), '')
})

test('an unlisted origin gets no CORS header', async () => {
  const res = await fetch(`${url}/api/health`, {
    headers: { Origin: 'https://some-random-site.com' },
  })
  assert.equal(res.status, 200)
  assert.equal(res.headers.get('access-control-allow-origin'), null)
})

test('a write failure returns 500 and the server stays up', async () => {
  // Arquivo somente leitura: a escrita falha com EACCES. Sem o try/catch
  // do server.js isso derrubaria o processo inteiro.
  await chmod(FILE, 0o444)
  try {
    assert.equal((await send(valid)).status, 500)
  } finally {
    await chmod(FILE, 0o644)
  }
  // O que importa: o processo sobreviveu e ainda responde.
  assert.equal((await fetch(`${url}/api/health`)).status, 200)
})

test('health answers and an unknown route gives 404', async () => {
  assert.equal((await fetch(`${url}/api/health`)).status, 200)
  assert.equal((await fetch(`${url}/api/nothing`)).status, 404)
})
