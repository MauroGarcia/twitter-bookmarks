# CLAUDE.md

Este arquivo fornece orientação ao Claude Code (claude.ai/code) ao trabalhar com código neste repositório.

## Visão Geral do Projeto

**Twitter Bookmarks** é uma aplicação desktop Electron multiplataforma que permite aos usuários importar, organizar, pesquisar e gerenciar seus bookmarks do Twitter localmente. Todos os dados são armazenados localmente usando SQLite — nenhum dado sai da máquina do usuário.

### Principais Funcionalidades
- Importar bookmarks do arquivo `bookmarks.js` do Twitter
- Organização baseada em tags com cores personalizadas
- Busca em texto completo (FTS5) em conteúdo de tweets, nomes de autores e handles
- Notas pessoais por bookmark
- Banco de dados SQLite local com armazenamento persistente em `%AppData%\Local\twitter-bookmarks\`

## Arquitetura

### Modelo de Processos (Electron)

A aplicação usa um **modelo de três processos** para segurança e separação de responsabilidades:

1. **Main Process** (`src/electron/index.js`)
   - Gerencia o ciclo de vida da aplicação (criação de janelas, eventos de saída)
   - Inicializa o banco de dados SQLite na inicialização
   - Registra handlers IPC que aceitam requisições do renderer
   - Gerencia diálogos de arquivo para operações de importação
   - Abre DevTools em modo de desenvolvimento

2. **Renderer Process** (`src/renderer/App.jsx` + componentes)
   - Aplicação React com UI construída com Tailwind CSS
   - Comunica com o main process **apenas** via IPC (sem acesso direto a node)
   - Store global Zustand para gerenciamento de estado
   - Não tem acesso direto ao sistema de arquivos ou banco de dados

3. **Preload Script** (`src/preload/index.js`)
   - Faz bridge entre main e renderer com **isolamento de contexto habilitado**
   - Expõe métodos IPC seguros ao renderer (via `window.ipcRenderer`)
   - Impede que o renderer acesse APIs do Node.js diretamente

### Fluxo de Dados

```
Renderer (React Component)
  ↓ (chama window.ipcRenderer.invoke)
Preload (Context Bridge)
  ↓ (encaminha para main process)
Main Process (IPC Handler)
  ↓ (chama função do banco de dados)
SQLite Database
  ↓ (retorna resultados)
Main Process → Preload → Renderer → Zustand Store → Re-renderização de Componentes
```

### Organização de Módulos

**Módulos do Main Process:**
- `src/electron/index.js` — Ponto de entrada, criação de janelas, ciclo de vida
- `src/electron/db.js` — Definição de schema SQLite, funções de query (getBookmarks, createTag, etc.)
- `src/electron/ipc-handlers.js` — Definições de canais IPC que executam operações do banco de dados
- `src/electron/twitter-importer.js` — Parser do formato `bookmarks.js` do Twitter

**Módulos do Renderer:**
- `src/renderer/App.jsx` — Componente root, estrutura de layout (Sidebar + Header + BookmarkList)
- `src/renderer/store/appStore.js` — Store Zustand: bookmarks, tags, query de busca, bookmark selecionado, diálogos
- `src/renderer/hooks/` — Hooks customizados (useBookmarks, useTags, useDebounce)
- `src/renderer/components/` — Componentes UI (BookmarkCard, BookmarkList, TagSelector, TweetDetail, etc.)

## Schema do Banco de Dados

**Tabelas:**
- `bookmarks` — Dados de tweets (id, full_text, author_name, author_handle, created_at, like_count, retweet_count, media_urls, urls, raw_json)
- `tags` — Tags personalizadas (id, name, color, created_at)
- `bookmark_tags` — Relacionamento muitos-para-muitos entre bookmarks e tags
- `notes` — Notas pessoais por bookmark (id, bookmark_id, content, created_at, updated_at)
- `bookmarks_fts` — Tabela virtual FTS5 para busca em texto completo (sincronizada via triggers na tabela bookmarks)

**Índices & Triggers:**
- Triggers FTS5 auto-populam a tabela `bookmarks_fts` em INSERT/DELETE de bookmarks
- WAL (Write-Ahead Logging) habilitado para melhor concorrência

## Comandos de Desenvolvimento

```bash
npm install --legacy-peer-deps  # Instalar dependências (necessário para este setup)

npm run dev       # Iniciar dev server com hot reload (Vite + Electron)
                  # Abre app em modo desenvolvimento com DevTools visível
                  # Renderer carrega de http://localhost:5173

npm run build     # Compilar código otimizado (compilação Vite)
                  # Outputs para dist/ e out/

npm run preview   # Visualizar app construído antes de empacotar

npm run pack      # Empacotar app sem criar instalador (pasta sem desinstalador)

npm run dist      # Compilar + gerar instalador NSIS (.exe)
                  # Cria pacote de release com instalador
```

## Adicionando Funcionalidades

### Adicionando um Novo Handler IPC

1. Criar uma função de banco de dados em `src/electron/db.js`
2. Registrar um handler IPC em `src/electron/ipc-handlers.js`:
   ```javascript
   ipcMain.handle('module:action', createErrorHandler('module:action', (event, ...args) => {
     return db.yourFunction(args)
   }))
   ```
3. Chamar do renderer via store Zustand ou hook customizado:
   ```javascript
   const result = await window.ipcRenderer.invoke('module:action', payload)
   ```

### Adicionando um Novo Componente UI

1. Criar componente em `src/renderer/components/ComponentName.jsx`
2. Importar e usar em `App.jsx` ou outros componentes
3. Se precisar de estado global, adicionar seletores/ações a `src/renderer/store/appStore.js`
4. Usar hook Zustand no componente:
   ```javascript
   const { bookmarks, setSelectedBookmark } = useAppStore()
   ```

### Migrações de Banco de Dados

- Mudanças de schema devem ser aplicadas em `initDb()` em `src/electron/db.js`
- Use `CREATE TABLE IF NOT EXISTS` para executar migrações com segurança a cada inicialização
- Para mudanças de schema que quebram compatibilidade, considere versionamento ou lógica de backup

## Dependências-Chave

| Pacote | Propósito |
|--------|-----------|
| `electron` | Framework desktop |
| `electron-vite` | Ferramenta de build para apps Electron |
| `electron-builder` | Geração de instalador NSIS |
| `react` 19 | Biblioteca UI |
| `zustand` | Gerenciamento de estado (mínimo, sem boilerplate) |
| `tailwindcss` 4 | CSS utility-first |
| `better-sqlite3` | Bindings nativos SQLite |
| `lucide-react` | Biblioteca de ícones |

## Notas Importantes

- **Sem TypeScript**: Projeto usa JavaScript/JSX puro (sem arquivos .ts/.tsx)
- **Sem problemas de peer deps**: Instale com `--legacy-peer-deps` para lidar com compatibilidade do Tailwind 4
- **Modo dev auto-abre DevTools** na janela principal para depuração
- **Isolamento de contexto é rigoroso**: Renderer não pode require/import módulos Node; todo I/O de arquivo e acesso DB deve ir via IPC
- **Zustand é preferido** em relação a Context API para estado global para manter código mínimo e performático

## Configuração de Build

- **electron-vite.config.mjs**: Configura builds de main, preload e renderer
  - Main: Agrupa código Node.js, marca `better-sqlite3` como externo
  - Preload: Script isolado de context bridge
  - Renderer: App React com Vite, alias de caminho `@/` aponta para `src/renderer/`

## Testes & QA

O projeto inclui documentação de QA e templates de teste:
- `QA_TEST_PLAN.json` — Cenários de teste e checklist
- `tests/manual/test-bookmarks.js`, `tests/manual/test-import.mjs` — Scripts utilitários para testes de importação

---

**Última atualização**: 2026-03-28
**Suporta**: Node.js v25+, npm 11+, Windows 10/11

