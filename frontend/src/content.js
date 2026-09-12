// Todo o texto do site fica aqui. O que é igual nos dois idiomas
// (links, anos, tags, ids) é escrito uma vez só; só a prosa é duplicada.

// A ordem aqui é a ordem dos botões no seletor de idioma.
export const languages = ['en', 'pt']

// Títulos de seção, labels do nav e do formulário. O nav e os headings
// usam as mesmas chaves, então renomear uma seção é em um lugar só.
export const ui = {
  en: {
    stack: 'Stack',
    projects: 'Projects',
    timeline: 'Timeline',
    contact: 'Contact',
    skip: 'Skip to content',
    live: 'live',
    code: 'code',
    learned: 'learned',
    formTitle: 'Or send me a message',
    name: 'Name',
    email: 'Email',
    message: 'Message',
    send: 'Send',
    sending: 'Sending…',
    sent: 'Got it. I will reply soon.',
    // Nomeia a saída, não a causa: quem lê isso não reinicia servidor.
    failed: 'The form did not go through. Write to me directly:',
    footer: 'Built by hand, updated as I learn.',
    langLabel: 'Language',
    // Imprime o tema para o qual vai mudar, feito flag de linha de comando.
    themeToDark: 'Switch to the dark theme',
    themeToLight: 'Switch to the light theme',
    title: 'Reis — Web Development',
  },
  pt: {
    stack: 'Stack',
    projects: 'Projetos',
    timeline: 'Trajetória',
    contact: 'Contato',
    skip: 'Pular para o conteúdo',
    live: 'ver online',
    code: 'código',
    learned: 'aprendi',
    formTitle: 'Ou me manda uma mensagem',
    name: 'Nome',
    email: 'E-mail',
    message: 'Mensagem',
    send: 'Enviar',
    sending: 'Enviando…',
    sent: 'Recebido. Respondo em breve.',
    failed: 'O formulário não foi. Me escreve direto:',
    footer: 'Feito na mão, atualizado enquanto aprendo.',
    langLabel: 'Idioma',
    themeToDark: 'Mudar para o tema escuro',
    themeToLight: 'Mudar para o tema claro',
    title: 'Reis — Desenvolvimento Web',
  },
}

// Cada id precisa bater com uma chave em `ui` e com o id de uma <section>
// no App.jsx. É isso que faz os links âncora funcionarem.
export const nav = ['stack', 'projects', 'timeline', 'contact']

export const site = {
  // Iguais nos dois idiomas
  brand: 'REIS', // aparece na barra de navegação
  name: 'Reis',
  email: 'guilhermealmreis@gmail.com',

  en: {
    // O que estiver dentro do <em> recebe o destaque colorido.
    headline: 'Learning to build things <em>that stay useful.</em>',
    intro:
      'Web Developer. Always expanding my horizons and trying new things. ' +
      'I use modern frameworks on the front, Node or Python on the back, and document the journey as I learn.',
    location: 'Brazil',
  },
  pt: {
    headline: 'Aprendendo a construir coisas <em>que continuam úteis.</em>',
    intro:
      'Desenvolvedor Web. Sempre expandindo horizontes e testando coisas novas. ' +
      'Uso frameworks modernos no front, Node ou Python no back, e documento o caminho enquanto aprendo.',
    location: 'Brasil',
  },
}

// Separar o que eu uso de verdade do que ainda estou aprendendo.
export const stack = [
  {
    items: ['JavaScript', 'React', 'Vite', 'HTML', 'CSS', 'Git'],
    en: { group: 'Using now' },
    pt: { group: 'Uso hoje' },
  },
  {
    items: ['Node.js', 'Java', 'SQL', 'TypeScript', 'Python'],
    en: { group: 'Learning' },
    pt: { group: 'Aprendendo' },
  },
  {
    items: ['Linux', 'VS Code', 'Figma','Premiere Pro', 'LLMs'],
    en: { group: 'Tools' },
    pt: { group: 'Ferramentas' },
  },
  
]

// `link`, `repo` e `image` são opcionais. Sem `image` o card desenha uma
// capa gerada, então print faltando não deixa buraco no layout.
// Screenshot vai em `frontend/public/projects/` e entra aqui como
// `/projects/<arquivo>`.
export const projects = [
  {
    year: '2026',
    tags: ['React', 'Vite', 'localStorage', 'CSS', 'JavaScript'],
    link: 'https://unimath-app.vercel.app/',
    repo: 'https://github.com/Galmreis/UnimathApp',
    image: '',
    en: {
      name: 'UnimathApp',
      summary:
        'Math trainer for the UFRGS entrance exam. Questions by topic, score ' +
        'history and progress saved in the browser — no backend, so it works ' +
        'offline and costs nothing to host.',
      learned:
        'Keeping state consistent across sessions with localStorage, and ' +
        'structuring the question bank so that adding a topic never means ' +
        'touching a component.',
    },
    pt: {
      name: 'UnimathApp',
      summary:
        'Treinador de matemática para o vestibular da UFRGS. Questões por tópico, ' +
        'histórico de acertos e progresso salvos no navegador — sem backend, então ' +
        'funciona offline e não custa nada para hospedar.',
      learned:
        'Manter o estado consistente entre sessões com localStorage, e estruturar ' +
        'o banco de questões para que adicionar um tópico nunca signifique mexer ' +
        'em componente.',
    },
  },
  {
    year: '2026',
    tags: ['React', 'Hooks'],
    link: '',
    repo: '',
    image: '',
    en: {
      name: 'Mental Math Trainer',
      summary: 'Timed mental arithmetic drills. A round of questions against the clock.',
      learned:
        'How state and timers get along in React: keeping a countdown running ' +
        'without blocking the interface, and clearing it properly when the ' +
        'round ends.',
    },
    pt: {
      name: 'Mental Math Trainer',
      summary: 'Exercícios de cálculo mental cronometrados. Uma rodada de questões contra o relógio.',
      learned:
        'Como estado e temporizadores convivem em React: manter uma contagem ' +
        'rodando sem travar a interface, e limpá-la direito quando a rodada acaba.',
    },
  },
  {
    year: '2026',
    tags: ['React', 'Node.js', 'CSS', 'JavaScript'],
    link: '',
    repo: 'https://github.com/Galmreis/TyphoonWiki',
    image: '',
    en: {
      name: 'TyphoonWiki',
      summary:
        'Fighting game wiki with frame data and short guides for the games I ' +
        'play, written for the Brazilian FGC.',
      learned:
        'Modelling a lot of structured data so it stays editable by hand, and ' +
        'writing the contact backend in plain Node with zero dependencies.',
    },
    pt: {
      name: 'TyphoonWiki',
      summary:
        'Wiki de jogos de luta com frame data e guias curtos dos jogos que eu ' +
        'jogo, escrita para a comunidade brasileira de fighting games.',
      learned:
        'Modelar um volume grande de dados estruturados sem virar bagunça, e ' +
        'escrever o backend do contato em Node puro, sem nenhuma dependência.',
    },
  },
]


// Mais recente primeiro. `period` fica dentro de cada idioma porque alguns
// têm palavra ("now" / "agora"), não só ano.
export const timeline = [
  {
    id: 'busqy',
    current: true,
    en: {
      period: '2026 — now',
      title: 'IT Support Analyst Junior',
      where: 'Busqy',
      text: 'Customer service through chat, general troubleshooting along with bug fixes and feature updates to the platform itself ' + 'using Python, Flask, Tailwind and PostgreSQL, with AI assistance.',
    },
    pt: {
      period: '2026 — agora',
      title: 'Analista de Suporte Técnico Junior',
      where: 'Busqy',
      text: 'Atendimento ao cliente via chat, troubleshooting geral junto com atualizações e bug fixes para a plataforma em si usando Python, Flask, Tailwind e PostgreSQL com auxílio de Inteligência Artificial.',
    },
  },
  {
    id: 'unisinos',
    current: true,
    en: {
      period: '2025 — now',
      title: 'Analysis and Systems Development',
      where: 'Unisinos',
      text:
        'Degree at Unisinos (Universidade do Vale do Rio dos Sinos). ' +
        'Study and practice across the tools and trends of the IT market.',
    },
    pt: {
      period: '2025 — agora',
      title: 'Análise e Desenvolvimento de Sistemas',
      where: 'Unisinos',
      text:
        'Curso superior na Unisinos (Universidade do Vale do Rio dos Sinos). ' +
        'Estudo e prática das ferramentas e tendências do mercado de TI.',
    },
  },
  {
    id: 'caldeira',
    en: {
      period: '2025',
      title: 'Geração Caldeira - Java Programming Track',
      where: 'Instituto Caldeira (Caldeira Institute)',
      text:
        'Course focused on learning the Java Web ecosystem ' +
        'with small projects and assignments using Java 21, Swagger documentation and API work, using modern version-control tools like Git.',
    },
    pt: {
      period: '2025',
      title: 'Geração Caldeira - Trilha Programação Java',
      where: 'Instituto Caldeira',
      text:
        'Curso focado em aprender o ecossistema Java na web ' +
        'com projetos e tarefas usando Java 21, documentação em Swagger e consumo de API, com ferramentas modernas de controle de versão como Git.',
    },
  },
  {
    id: 'first-project',
    en: {
      period: '2024 — 2025',
      title: 'First project shipped',
      where: 'Personal',
      text: 'First time someone who was not me used something I wrote.',
    },
    pt: {
      period: '2024 — 2025',
      title: 'Primeiro projeto publicado',
      where: 'Pessoal',
      text: 'Primeira vez que alguém que não era eu usou algo que eu escrevi.',
    },
  },
]

// A label vem de `ui` para traduzir; value e href são iguais nos dois.
export const contacts = [
  { key: 'email', value: 'guilhermealmreis@gmail.com', href: 'mailto:guilhermealmreis@gmail.com' },
  { key: 'GitHub', value: '@Galmreis', href: 'https://github.com/Galmreis' },
  { key: 'LinkedIn', value: '/guilhermeareiss', href: 'https://linkedin.com/in/guilhermeareiss' },
]

// Terminal do hero. Os comandos não ficam aqui: `ls` e `cd` são comandos,
// não texto, e não se traduz. Só a resposta depende do idioma.
// {cmd} e {arg} são placeholders que o Terminal.jsx troca, para cada idioma
// poder pôr o valor onde a frase pede.

// Carimbado pelo Vite no build, ver vite.config.js.
export const build = __BUILD__

export const machine = {
  os: 'Arch Linux',
  shell: 'bash',
  editor: 'VS Code',
  wm: 'KDE Plasma',
}

export const terminal = {
  en: {
    label: 'Interactive terminal',
    hint: "type 'help' and press Enter",
    boot: [
      'reis.portfolio — build {build}',
      "type 'help' for the command list, or 'neofetch' to start.",
    ],
    helpTitle: 'available commands',
    // [comando, o que faz], renderizado em duas colunas.
    help: [
      ['help', 'this list'],
      ['whoami', 'the short version'],
      ['neofetch', 'system info, with the Arch logo'],
      ['ls', 'list the sections of this page'],
      ['cd <section>', 'scroll to a section'],
      ['stack', 'what I use and what I am learning'],
      ['projects', 'what I have built'],
      ['contact', 'how to reach me'],
      ['art [name]', 'ASCII art: arch, invader, rain, code, palette'],
      ['clear', 'wipe the screen'],
    ],
    labels: {
      now: 'now',
      role: 'role',
      location: 'location',
      os: 'os',
      shell: 'shell',
      editor: 'editor',
      wm: 'wm',
      using: 'using',
      learning: 'learning',
    },
    role: 'Web Development student',
    notFound: "command not found: {cmd}. try 'help'.",
    jumping: 'opening {arg}...',
    noSection: 'no such section: {arg}',
    needsArg: "cd needs a section. try 'ls' first.",
    noArt: 'no art named {arg}. try: arch, invader, rain, code, palette',
    sudo: 'this incident will be reported.',
    exit: 'there is no exit. it is a portfolio.',
    demo: 'demo',
    demoDone: "your turn — type 'help'.",
    empty: '',
  },
  pt: {
    label: 'Terminal interativo',
    hint: "digite 'help' e aperte Enter",
    boot: [
      'reis.portfolio — build {build}',
      "digite 'help' para a lista de comandos, ou 'neofetch' para começar.",
    ],
    helpTitle: 'comandos disponíveis',
    help: [
      ['help', 'esta lista'],
      ['whoami', 'a versão curta'],
      ['neofetch', 'infos do sistema, com o logo do Arch'],
      ['ls', 'lista as seções desta página'],
      ['cd <seção>', 'rola até uma seção'],
      ['stack', 'o que eu uso e o que estou aprendendo'],
      ['projects', 'o que eu construí'],
      ['contact', 'como falar comigo'],
      ['art [nome]', 'arte ASCII: arch, invader, rain, code, palette'],
      ['clear', 'limpa a tela'],
    ],
    labels: {
      now: 'agora',
      role: 'função',
      location: 'local',
      os: 'so',
      shell: 'shell',
      editor: 'editor',
      wm: 'wm',
      using: 'uso hoje',
      learning: 'aprendendo',
    },
    role: 'Estudante de Desenvolvimento Web',
    notFound: "comando não encontrado: {cmd}. tente 'help'.",
    jumping: 'abrindo {arg}...',
    noSection: 'seção inexistente: {arg}',
    needsArg: "cd precisa de uma seção. tente 'ls' antes.",
    noArt: 'não existe arte chamada {arg}. tente: arch, invader, rain, code, palette',
    sudo: 'este incidente será reportado.',
    exit: 'não há saída. isto é um portfólio.',
    demo: 'demo',
    demoDone: "sua vez — digite 'help'.",
    empty: '',
  },
}
