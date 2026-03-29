# Twitter Bookmarks Organizer

Uma aplicacao Electron + React para importar, pesquisar e organizar bookmarks do Twitter/X localmente, com SQLite no desktop e uma camada compartilhada para web e renderer.

## Funcionalidades

- Importacao de bookmarks via arquivo `bookmarks.js`
- Tags com cores, filtros e atribuicao por bookmark
- Busca full-text com FTS5, chips por `#tag` e `@autor`, filtros combinaveis e paginação incremental
- Favoritos, arquivamento e notas por bookmark
- Persistencia local em SQLite
- Tooling local para agentes com skills de Electron, design, performance, React e E2E

## Comecando

### Instalacao

1. Baixe `Twitter Bookmarks Setup 1.0.0.exe` em [Releases](https://github.com/MauroGarcia/twitter-bookmarks/releases)
2. Execute o instalador
3. Abra "Twitter Bookmarks" pelo menu Iniciar ou desktop

### Importar bookmarks

1. Exporte seus bookmarks do Twitter/X em **Settings** > **Download your data**
2. Extraia o zip e localize `bookmarks.js` em `/data/`
3. No app, clique em **Importar** e selecione o arquivo

## Desenvolvimento

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
npm run dev       # Electron em modo dev
npm run dev:web   # Versao web compartilhada
npm run build     # Build completo do Electron
npm run build:web # Build da versao web
npm run pack      # Empacota sem instalador
npm run dist      # Gera instalador NSIS
npm run seed:mock # Popula dados mock para testes manuais
```

## Estrutura

```text
docs/
  analysis/                  Auditorias, QA e guias de implementacao
src/
  electron/                  Main process, SQLite e IPC
  preload/                   Context bridge seguro
  renderer/                  Entry Electron
  shared/                    Fonte principal de UI, store e logica compartilhadas
  web/                       Entry web
.agents/
  skills/                    Skills locais para agentes
tests/
  manual/                    Scripts utilitarios de teste
```

## Arquitetura atual

- `src/shared/*` e a implementacao principal da interface e do estado.
- `src/renderer/*` e `src/web/*` sao pontos de entrada e ainda mantem alguma duplicacao historica.
- A busca principal vive em `src/shared/components/SearchBar.jsx`.
- O store principal vive em `src/shared/store/appStore.js`.
- As queries estruturadas e full-text vivem em `src/electron/db.js`.
- A listagem principal vive em `src/shared/components/BookmarkList.jsx`.

## Estado atual de performance

Melhorias estaveis ja aplicadas:

- indice local para sugestoes de `#tags` e `@autores`
- filtros estruturados de tags e autores com colunas normalizadas/indexadas no SQLite
- `variant` de cards estabilizado por `bookmark.id`

Pontos ainda pendentes ou em avaliacao:

- virtualizacao/janelamento da lista principal
- revisao adicional do custo por card
- otimizacao do caminho mock para colecoes maiores

## Contexto para LLMs

- `CLAUDE.md` descreve arquitetura, fluxo de dados e convencoes gerais.
- `CODEX.md` resume o contexto operacional para sessoes do Codex.
- `.agents/skills/twitter-bookmarks-context/` concentra contexto curto do repositório.
- `.agents/skills/e2e-testing-patterns/` adiciona um guia de referencia para Playwright/Cypress.

## Banco de dados

SQLite local em `%AppData%\Local\twitter-bookmarks\bookmarks.db`.

Tabelas principais:

- `bookmarks`
- `tags`
- `bookmark_tags`
- `notes`
- `bookmarks_fts`

Colunas/indices relevantes de busca:

- `author_handle_normalized` para filtros por autor
- `name_normalized` para filtros por tag
- `bookmarks_fts` para full-text search

## Privacidade

Todos os dados ficam locais no computador do usuario. Nenhuma informacao e enviada para servidores externos.

## Stack tecnico

- React 19
- Zustand
- Tailwind CSS 4
- Electron
- SQLite com `better-sqlite3`
- Electron Vite
- Electron Builder

## Proximo foco

- performance de render da listagem
- estrategia de virtualizacao
- ampliacao de testes automatizados

## Licenca

MIT
