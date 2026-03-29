# CLAUDE.md

Este arquivo da um mapa rapido e atual do repositorio para o Claude Code.

## Resumo do projeto

Twitter Bookmarks e uma aplicacao Electron para importar, indexar, pesquisar e organizar bookmarks do Twitter/X localmente. Os dados ficam na maquina do usuario e sao persistidos em SQLite.

## Caminhos canonicos do codigo

- `src/shared/` e a implementacao principal de UI, store e logica reutilizavel.
- `src/renderer/` e o entry do renderer Electron e ainda contem alguma duplicacao historica.
- `src/web/` e o entry web da UI compartilhada.
- `src/electron/` concentra SQLite, importacao e handlers IPC.
- `src/preload/` expoe a bridge segura usada pelo renderer.

Ao mudar comportamento de UI ou estado, inspecione `src/shared/*` primeiro e confirme se os arquivos espelhados em `src/renderer/*` tambem precisam de ajuste.

## Arquitetura em runtime

- Main process: `src/electron/index.js`
- Handlers IPC: `src/electron/ipc-handlers.js`
- Banco e queries de busca: `src/electron/db.js`
- Shell compartilhado: `src/shared/App.jsx`
- Store compartilhado: `src/shared/store/appStore.js`
- Busca principal: `src/shared/components/SearchBar.jsx`
- Lista principal: `src/shared/components/BookmarkList.jsx`

O fluxo de dados e: componente React -> store compartilhado -> fachada de API -> preload bridge -> handler IPC -> SQLite -> retorno ao store -> render.

## Stack de busca

- Busca full-text usa SQLite FTS5 em `bookmarks_fts`.
- Filtros estruturados de tags usam `tags.name_normalized`.
- Filtros estruturados de autores usam `bookmarks.author_handle_normalized`.
- Sugestoes de `#tag` e `@autor` sao indexadas no cliente em `src/shared/components/SearchBar.jsx`.
- A orquestracao de fetch, paginacao e cache vive em `src/shared/store/appStore.js`.

## Estado atual de performance

Melhorias estaveis ja presentes no branch:

- sugestoes indexadas no cliente para chips de tag/autor
- filtros SQLite de tags e autores normalizados/indexados
- `variant` estavel de cards derivado de `bookmark.id`

Proximos alvos conhecidos:

- virtualizar ou janelar a lista principal
- reduzir custo de render sem piorar a latencia percebida da busca
- reduzir o custo do caminho mock em colecoes maiores

Um experimento que precomputava texto/data para render dos cards foi retirado do branch e guardado em stash para comparacao. Nao assuma que essa otimizacao esta ativa.

## Regras de trabalho neste repo

- Prefira editar `src/shared/*`, a menos que a tarefa seja especifica de entry.
- Tome cuidado com arquivos duplicados em `src/renderer/*`; confirme se eles ainda sao usados antes de mexer nas duas arvores.
- Migracoes de banco pertencem a `initDb()` em `src/electron/db.js`.
- O renderer nao deve acessar APIs Node diretamente; todo acesso a arquivo/DB passa por IPC.
- Zustand e a fonte de verdade do estado global de UI.

## Comandos uteis

```bash
npm install --legacy-peer-deps
npm run dev
npm run dev:web
npm run build
npm run build:web
npm run seed:mock
```

## Arquivos de contexto para LLMs

- `README.md` para visao geral humana
- `CODEX.md` para guia operacional do Codex
- `.agents/skills/twitter-bookmarks-context/SKILL.md` para contexto compacto do projeto
- `.agents/skills/e2e-testing-patterns/SKILL.md` para referencia de padroes E2E

Ultima atualizacao: 2026-03-29
