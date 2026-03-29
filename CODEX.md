# CODEX.md

This file is the shortest reliable bootstrap for Codex sessions in this repository.

## Start Here

- Read `src/shared/*` before touching `src/renderer/*`.
- Treat `src/shared/` as the canonical UI and state layer.
- Expect some historical duplication under `src/renderer/`.
- Keep all filesystem and database access behind Electron IPC.

## Important Files

- `src/shared/App.jsx`
- `src/shared/store/appStore.js`
- `src/shared/components/SearchBar.jsx`
- `src/shared/components/BookmarkList.jsx`
- `src/electron/db.js`
- `src/electron/ipc-handlers.js`

## Search and Performance Context

Current stable optimizations:

- client-side indexed suggestions for tag and author chips
- normalized/indexed SQLite filters for tags and authors
- stable bookmark card variants derived from `bookmark.id`

Current known bottlenecks:

- result list is not virtualized
- bookmark cards are still relatively expensive to paint
- mock filtering path scales linearly

Important note:

- a precompute-render-data experiment for bookmark cards was intentionally removed from the branch and kept only in stash for comparison

## Working Preferences

- prefer small atomic commits
- validate with `npm run build` for Electron-affecting changes
- validate with `npm run build:web` for shared/web-only changes
- keep Zustand as the single source of truth for global UI state
- put DB migrations in `initDb()`

## Extra Context

- `README.md` is the human overview
- `CLAUDE.md` is the fuller repository guide
- `.agents/skills/twitter-bookmarks-context/SKILL.md` is the compact reusable project context
