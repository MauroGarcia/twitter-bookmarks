# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Twitter Bookmarks** is a cross-platform Electron desktop application that allows users to locally import, organize, search, and manage their Twitter bookmarks. All data is stored locally using SQLite — no data leaves the user's machine.

### Key Features
- Import bookmarks from Twitter's `bookmarks.js` export file
- Tag-based organization with custom colors
- Full-text search (FTS5) across tweet content, author names, and handles
- Personal notes per bookmark
- Local SQLite database with persistent storage in `%AppData%\Local\twitter-bookmarks\`

## Architecture

### Process Model (Electron)

The app uses a **three-process model** for security and separation of concerns:

1. **Main Process** (`src/electron/index.js`)
   - Manages application lifecycle (window creation, quit events)
   - Initializes SQLite database at startup
   - Registers IPC handlers that accept requests from the renderer
   - Handles file dialogs for import operations
   - Opens DevTools in development mode

2. **Renderer Process** (`src/renderer/App.jsx` + components)
   - React application with UI built in Tailwind CSS
   - Communicates with main process **only** via IPC (no direct node access)
   - Zustand global store for state management
   - Does not have direct access to the filesystem or database

3. **Preload Script** (`src/preload/index.js`)
   - Bridges main and renderer with **context isolation enabled**
   - Exposes safe IPC methods to the renderer (via `window.ipcRenderer`)
   - Prevents renderer from accessing Node.js APIs directly

### Data Flow

```
Renderer (React Component)
  ↓ (calls window.ipcRenderer.invoke)
Preload (Context Bridge)
  ↓ (forwards to main process)
Main Process (IPC Handler)
  ↓ (calls database function)
SQLite Database
  ↓ (returns results)
Main Process → Preload → Renderer → Zustand Store → Component Re-render
```

### Module Organization

**Main Process Modules:**
- `src/electron/index.js` — Entry point, window creation, lifecycle
- `src/electron/db.js` — SQLite schema definition, query functions (getBookmarks, createTag, etc.)
- `src/electron/ipc-handlers.js` — IPC channel definitions that execute database operations
- `src/electron/twitter-importer.js` — Parser for Twitter's `bookmarks.js` format

**Renderer Modules:**
- `src/renderer/App.jsx` — Root component, layout structure (Sidebar + Header + BookmarkList)
- `src/renderer/store/appStore.js` — Zustand store: bookmarks, tags, search query, selected bookmark, dialogs
- `src/renderer/hooks/` — Custom hooks (useBookmarks, useTags, useDebounce)
- `src/renderer/components/` — UI components (BookmarkCard, BookmarkList, TagSelector, TweetDetail, etc.)

## Database Schema

**Tables:**
- `bookmarks` — Tweet data (id, full_text, author_name, author_handle, created_at, like_count, retweet_count, media_urls, urls, raw_json)
- `tags` — Custom tags (id, name, color, created_at)
- `bookmark_tags` — Many-to-many relationship between bookmarks and tags
- `notes` — Personal notes per bookmark (id, bookmark_id, content, created_at, updated_at)
- `bookmarks_fts` — FTS5 virtual table for full-text search (synced via triggers on bookmarks table)

**Indexes & Triggers:**
- FTS5 triggers auto-populate the `bookmarks_fts` table on INSERT/DELETE of bookmarks
- WAL (Write-Ahead Logging) enabled for better concurrency

## Development Commands

```bash
npm install --legacy-peer-deps  # Install dependencies (required for this setup)

npm run dev       # Start dev server with hot reload (Vite + Electron)
                  # Opens app in dev mode with DevTools visible
                  # Renderer loads from http://localhost:5173

npm run build     # Build optimized code (Vite compilation)
                  # Outputs to dist/ and out/

npm run preview   # Preview built app before packaging

npm run pack      # Package app without creating installer (uninstaller-less folder)

npm run dist      # Build + generate NSIS installer (.exe)
                  # Creates release package with installer
```

## Adding Features

### Adding a New IPC Handler

1. Create a database function in `src/electron/db.js`
2. Register an IPC handler in `src/electron/ipc-handlers.js`:
   ```javascript
   ipcMain.handle('module:action', createErrorHandler('module:action', (event, ...args) => {
     return db.yourFunction(args)
   }))
   ```
3. Call from renderer via the Zustand store or a custom hook:
   ```javascript
   const result = await window.ipcRenderer.invoke('module:action', payload)
   ```

### Adding a New UI Component

1. Create component in `src/renderer/components/ComponentName.jsx`
2. Import and use in `App.jsx` or other components
3. If it needs global state, add selectors/actions to `src/renderer/store/appStore.js`
4. Use Zustand hook in component:
   ```javascript
   const { bookmarks, setSelectedBookmark } = useAppStore()
   ```

### Database Migrations

- Schema changes must be applied in `initDb()` in `src/electron/db.js`
- Use `CREATE TABLE IF NOT EXISTS` to safely run migrations on every startup
- For breaking schema changes, consider versioning or backup logic

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `electron` | Desktop framework |
| `electron-vite` | Build tool for Electron apps |
| `electron-builder` | NSIS installer generation |
| `react` 19 | UI library |
| `zustand` | State management (minimal, no boilerplate) |
| `tailwindcss` 4 | Utility-first CSS |
| `better-sqlite3` | Native SQLite bindings |
| `lucide-react` | Icon library |

## Important Notes

- **No TypeScript**: Project uses plain JavaScript/JSX (no .ts/.tsx files)
- **No peer deps issues**: Install with `--legacy-peer-deps` to handle Tailwind 4 compatibility
- **Dev mode auto-opens DevTools** in the main window for debugging
- **Context isolation is strict**: Renderer cannot require/import Node modules; all file I/O and DB access must go through IPC
- **Zustand is preferred** over Context API for global state to keep code minimal and performant

## Build Configuration

- **electron-vite.config.mjs**: Configures main, preload, and renderer builds
  - Main: Bundles Node.js code, marks `better-sqlite3` as external
  - Preload: Isolated context bridge script
  - Renderer: React app with Vite, path alias `@/` points to `src/renderer/`

## Testing & QA

The project includes QA documentation and test templates:
- `QA_TEST_PLAN.json` — Test scenarios and checklist
- `tests/manual/test-bookmarks.js`, `tests/manual/test-import.mjs` — Utility scripts for import testing

---

**Last updated**: 2026-03-28
**Supports**: Node.js v25+, npm 11+, Windows 10/11

