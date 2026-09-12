# Screenshots dos projetos

Coloque o arquivo aqui e aponte no `src/content.js`:

```js
image: '/projects/unimath.png',
```

A barra do começo importa: tudo que está em `public/` é servido a partir da
raiz do site, então `public/projects/unimath.png` é acessado como
`/projects/unimath.png`.

Proporção de mais ou menos 16:10 (1280x800, por exemplo). O card corta com
`object-fit: cover`, então imagem fora dessa proporção é aparada, não
espremida.

Até uns 300 KB cada, em WebP ou JPEG comprimido. Com `image: ''` o card
desenha uma textura gerada no lugar.
