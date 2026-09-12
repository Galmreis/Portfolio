// Arte ASCII. Fica fora do content.js porque desenho não se traduz.
// Cada peça é um array de linhas, e todas as linhas de uma peça precisam
// ter a mesma largura, senão o desenho entorta.

export const art = {
  // O logo do Arch, o mesmo que o neofetch imprime.
  arch: [
    '                   -`                 ',
    '                  .o+`                ',
    '                 `ooo/                ',
    '                `+oooo:               ',
    '               `+oooooo:              ',
    '               -+oooooo+:             ',
    '             `/:-:++oooo+:            ',
    '            `/++++/+++++++:           ',
    '           `/++++++++++++++:          ',
    '          `/+++ooooooooooooo/`        ',
    '         ./ooosssso++osssssso+`       ',
    '        .oossssso-````/ossssss+`      ',
    '       -osssssso.      :ssssssso.     ',
    '      :osssssss/        osssso+++.    ',
    '     /ossssssss/        +ssssooo/-    ',
    '   `/ossssso+/:-        -:/+osssso+-  ',
    '  `+sso+:-`                 `.-/+oso: ',
    ' `++:.                           `-/+/',
    ' .`                                 `/',
  ],

  // Space Invader, o sprite original do arcade.
  invader: [
    '   █     █   ',
    '    █   █    ',
    '   ███████   ',
    '  ██ ███ ██  ',
    ' ███████████ ',
    ' █ ███████ █ ',
    ' █ █     █ █ ',
    '    ██ ██    ',
  ],

  // O loop que esse portfólio inteiro é.
  code: [
    '┌─────────────────────────┐',
    '│ while (learning) {      │',
    '│   build(things);        │',
    '│   ship();               │',
    '│ }                       │',
    '└─────────────────────────┘',
  ],

  // Paleta de pintor.
  palette: [
    '       .-------.     ',
    '     .\'         \'.   ',
    '    /   o  o  o   \\  ',
    '   |  o         o  | ',
    '   |       .-.     | ',
    '    \\     (   )   /  ',
    '     \'.    \'-\'  .\'   ',
    '       \'-------\'     ',
  ],
}

// A ordem que o `art` sem argumento percorre. Precisa listar todo nome que
// o `help` anuncia, inclusive os animados: `rain` está em `animations`.
export const artNames = ['arch', 'invader', 'rain', 'code', 'palette']

// Animação é `{ fps, frame(i) }`. O mesmo formato serve para o invader,
// que tem dois quadros desenhados na mão, e para a chuva, que calcula o
// quadro a partir do `i`. O Terminal.jsx não precisa saber qual é qual.

// O invader marcha trocando as pernas: só as duas últimas linhas mudam.
const INVADER_FRAMES = [
  [
    '   █     █   ',
    '    █   █    ',
    '   ███████   ',
    '  ██ ███ ██  ',
    ' ███████████ ',
    ' █ ███████ █ ',
    ' █ █     █ █ ',
    '    ██ ██    ',
  ],
  [
    '   █     █   ',
    '    █   █    ',
    '   ███████   ',
    '  ██ ███ ██  ',
    ' ███████████ ',
    ' █ ███████ █ ',
    '   █ ███ █   ',
    '  █       █  ',
  ],
]

// Só ASCII. Katakana teria mais cara de Matrix, mas ocupa duas colunas em
// fonte monoespaçada e a cascata entorta.
const GLYPHS = '01$#%&/|+=-<>*{}[]();:~^!?'

// Um quadro da cascata. Cada coluna cai na sua velocidade para não virar
// um pulso só. Determinístico no `i`, senão pisca.
function rainFrame(i, cols = 38, rows = 9) {
  const lines = []
  const span = rows * 2 // distância que a gota percorre antes de voltar

  for (let r = 0; r < rows; r += 1) {
    let line = ''
    for (let c = 0; c < cols; c += 1) {
      // Primos espalham as colunas sem Math.random(), que redesenharia
      // diferente a cada quadro.
      const speed = 1 + ((c * 7919) % 4) * 0.4
      const head = Math.floor((i * speed + ((c * 31) % span)) % span)
      const behind = head - r
      // Cabeça mais um rastro curto. Os multiplicadores precisam ser
      // coprimos com GLYPHS.length, senão o resto cai sempre nos mesmos
      // poucos caracteres e a linha fica listrada.
      line += behind >= 0 && behind < 5
        ? GLYPHS[(c * 31 + r * 17 + i * 7) % GLYPHS.length]
        : ' '
    }
    lines.push(line)
  }
  return lines
}

export const animations = {
  invader: { fps: 2.5, frame: (i) => INVADER_FRAMES[i % INVADER_FRAMES.length] },
  rain: { fps: 14, frame: rainFrame },
}

// Capa gerada, no lugar do screenshot que ainda não existe. Textura em vez
// de ícone de "imagem faltando": o ícone parece inacabado. A semente é o
// nome do projeto, então a capa não muda a cada render.

// Só blocos, todos de largura simples. Misturar caractere de outro bloco
// Unicode é o que entorta o desenho.
const SHADES = ' ░▒▓█'

export function coverFor(seed, cols = 22, rows = 7) {
  // Hash bobo, só para virar número. Não é segurança.
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0

  // Inclinação do padrão, tirada do nome, para dois projetos não saírem iguais.
  const tilt = 0.18 + (h % 7) * 0.06

  const lines = []
  for (let r = 0; r < rows; r += 1) {
    let line = ''
    for (let c = 0; c < cols; c += 1) {
      // Duas ondas, não três. Um terceiro termo multiplicando c por r
      // fazia células vizinhas caírem em tons sem relação e a capa saía
      // chuviscada. Uma onda por eixo dá um mapa de contorno.
      const n =
        Math.sin(c * 0.34 + r * tilt + (h % 97) * 0.11) +
        Math.cos(r * 0.62 - c * 0.05 + (h % 53) * 0.19)

      // n vai de -2 a 2; mapeia na rampa de tons.
      const i = Math.round(((n + 2) / 4) * (SHADES.length - 1))
      line += SHADES[Math.min(SHADES.length - 1, Math.max(0, i))]
    }
    lines.push(line)
  }
  return lines
}
