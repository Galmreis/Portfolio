# Portfolio — Reis

Site pessoal. React + Vite no frontend, Node puro no backend.

```bash
# backend  -> http://127.0.0.1:3000  (sem dependências, nada a instalar)
cd backend && npm run dev

# frontend -> http://localhost:5173
cd frontend && npm install --ignore-scripts && npm run dev
```

Todo o conteúdo do site está em `frontend/src/content.js`, com inglês e
português lado a lado.

Duas coisas ficam fora dele:

- **Screenshots dos projetos.** Coloque o arquivo em
  `frontend/public/projects/` e aponte no `content.js` como
  `image: '/projects/<arquivo>'`. Sem imagem o card desenha uma capa gerada.
- **A imagem de preview do link** (o que o LinkedIn mostra) é
  `frontend/public/og.png`. Para trocar, edite `assets/og-source.html` e
  reexporte:

  ```bash
  firefox --headless --screenshot "$PWD/frontend/public/og.png" \
          --window-size=1200,630 "file://$PWD/assets/og-source.html"
  ```

Antes de publicar, trocar o domínio provisório em `frontend/index.html`
(o `canonical` e as tags `og:`) pelo endereço real.
