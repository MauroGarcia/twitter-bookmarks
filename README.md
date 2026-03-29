# Twitter Bookmarks Organizer

Uma aplicação desktop para organizar, pesquisar e gerenciar seus bookmarks do Twitter localmente no Windows.

## ✨ Funcionalidades

- 📌 **Importação** - Importe todos os seus bookmarks do Twitter usando o arquivo `bookmarks.js`
- 🏷️ **Tags** - Organize seus bookmarks com tags personalizadas com cores
- 🔍 **Pesquisa** - Busque bookmarks por texto, autor ou combinações de filtros (FTS5)
- 📝 **Notas** - Adicione notas pessoais a cada bookmark
- 💾 **Armazenamento Local** - SQLite com dados persistentes em `%AppData%\twitter-bookmarks\`
- ⚡ **Interface Rápida** - UI moderna com React + Tailwind CSS

## 🚀 Começando

### Instalação

1. Baixe `Twitter Bookmarks Setup 1.0.0.exe` em [Releases](https://github.com/MauroGarcia/twitter-bookmarks/releases)
2. Execute o instalador
3. Abra "Twitter Bookmarks" do menu Iniciar ou desktop

### Importar Bookmarks

1. Faça export dos seus bookmarks do Twitter:
   - Vá em **Settings** → **Download your data**
   - Selecione e baixe seu arquivo de dados
   - Extraia o zip e procure por `bookmarks.js` (em `/data/`)

2. No app:
   - Clique em **"Importar Bookmarks"**
   - Selecione o arquivo `bookmarks.js`
   - Aguarde a importação

### Uso

#### 📚 Listar Bookmarks
- A lista principal mostra todos os seus bookmarks ordenados por data
- Cada card exibe autor, texto, likes e retweets

#### 🏷️ Gerenciar Tags
- **Criar tag**: Clique em um bookmark → "Editar" → Digite nome e crie
- **Atribuir tags**: Selecione um bookmark → "Editar" → Marque as tags desejadas
- **Filtrar**: Clique na tag na sidebar para filtrar apenas bookmarks com essa tag

#### 🔍 Pesquisar
- Use a barra de busca para pesquisar por:
  - Texto do tweet
  - Nome ou @handle do autor
  - Hashtags

#### 📝 Adicionar Notas
- Clique em um bookmark para abrir detalhes
- Na seção "Notas Pessoais", clique **Editar** e adicione suas anotações
- Clique **Salvar** para persistir

#### 🗑️ Deletar Bookmark
- Abra detalhes do bookmark
- Clique **Deletar Bookmark** no final

## 🛠️ Desenvolvimento

### Requisitos
- Node.js v25+
- npm 11+
- Windows 10/11

### Setup

```bash
git clone https://github.com/MauroGarcia/twitter-bookmarks.git
cd twitter-bookmarks
npm install --legacy-peer-deps
```

### Scripts

```bash
npm run dev       # Inicia app em desenvolvimento com hot reload
npm run build     # Build otimizado (Vite)
npm run dist      # Gera instalador NSIS (.exe)
npm run pack      # Empacota sem criar instalador
```

## 📁 Estrutura do Projeto

```
docs/
├── analysis/                 # Auditorias, QA, comparativos visuais e guias de implementação
src/
├── electron/                 # Runtime Electron principal
├── preload/                  # Context bridge (segurança)
├── renderer/                 # Entry renderer Electron
├── shared/                   # UI e lógica compartilhadas entre Electron e Web
└── web/                      # Entry web
tests/
└── manual/                   # Scripts utilitários de teste local
```

### Convenções mantidas na raiz

- `.agents/`, `.claude/`, `.cortex/` e `skills/` foram mantidos na raiz porque são diretórios de tooling/assistentes e normalmente dependem dessa localização.
- `electron.vite.config.mjs`, `vite.web.config.mjs`, `tailwind.config.js` e `package.json` permanecem na raiz por serem pontos de entrada de build.

## 🗄️ Banco de Dados

SQLite local em: `%AppData%\Local\twitter-bookmarks\bookmarks.db`

**Tabelas:**
- `bookmarks` - Tweets/bookmarks
- `tags` - Tags personalizadas
- `bookmark_tags` - Associação n:n
- `notes` - Notas pessoais
- `bookmarks_fts` - Índice FTS5 para busca

## 🔐 Privacidade

Todos os dados ficam **locais no seu computador**. Nenhuma informação é enviada para servidores externos.

## 🤝 Stack Técnico

- **Frontend**: React 19, Tailwind CSS 4, Zustand
- **Backend**: Electron, Node.js
- **Database**: SQLite + better-sqlite3
- **Build**: Electron Vite, Electron Builder
- **UI**: Lucide React icons

## 📝 Plano de Desenvolvimento

- ✅ Fase 1: Scaffold (Electron + React + SQLite)
- ✅ Fase 2: Importação (Parser bookmarks.js)
- ✅ Fase 3: Listagem (BookmarkCard, BookmarkList)
- ✅ Fase 4: Tags + Pesquisa (FTS5, TagSelector)
- ✅ Fase 5: Detalhes + Notas (TweetDetail modal)
- ✅ Fase 6: Build (NSIS installer)

## 🐛 Issues e Feedback

Reporte issues no repositório ou me envie feedback!

## 📄 Licença

MIT

---

**Made with ❤️ for managing your Twitter bookmarks**


