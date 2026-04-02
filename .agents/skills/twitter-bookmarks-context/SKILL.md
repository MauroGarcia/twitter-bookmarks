---
name: twitter-bookmarks-context
description: Use when working in this repository to quickly understand the canonical shared code paths, the Electron/web runtime split, the search stack, and the current performance cautions before making changes.
---

# Twitter Bookmarks Context

Use this skill at the start of work in this repository when you need fast, current project context.

## Canonical paths

- `src/shared/` is the canonical implementation for UI, store and reusable logic.
- `src/shared/services/api.js` is the runtime seam between shared code and the active backend implementation.
- `src/renderer/main.jsx` is the Electron renderer entry and injects the preload bridge with `setApi(window.api)`.
- `src/web/main.jsx` is the web entry and injects the HTTP/mock-backed API for the shared UI.
- `src/shared/mock/mockApi.js` is the local fallback used by the web entry and by shared state recovery paths.
- `src/electron/` owns SQLite, import, X auth/sync and IPC handlers.
- `src/preload/index.js` exposes the safe renderer bridge.

## Search map

- Main app shell: `src/shared/App.jsx`
- Main search UI: `src/shared/components/SearchBar.jsx`
- Main result list: `src/shared/components/BookmarkList.jsx`
- Import and X sync UI: `src/shared/components/ImportDialog.jsx`
- Shared store, pagination and cache flow: `src/shared/store/appStore.js`
- SQLite queries and migrations: `src/electron/db.js`
- Electron IPC boundary: `src/electron/ipc-handlers.js`

## Current stable behavior

- client-side indexed suggestions for `#tag` and `@author`
- normalized/indexed SQLite filters for structured tag/author queries
- incremental bookmark pagination with cache keyed by active filters
- automatic fallback to `mockApi` for empty/unavailable data paths
- stable bookmark card variants derived from `bookmark.id`

## Current caution points

- the bookmark list uses incremental loading but is not virtualized yet
- bookmark cards are still relatively expensive to paint
- mock filtering still scales linearly for larger datasets
- a precompute bookmark render-data experiment was intentionally removed and kept in stash only

## Recommended workflow

1. Inspect `src/shared/*` first.
2. Touch `src/renderer/*` only for Electron entry concerns; most UI/state changes stay in `src/shared/*`.
3. If the task touches search or listing, review `SearchBar`, `BookmarkList`, `appStore`, and `db.js` together.
4. If the task touches import or X sync, trace `ImportDialog` -> `shared/services/api.js` -> `preload/index.js`/`web/main.jsx` -> `ipc-handlers.js` -> `x-auth.js` and `x-bookmarks-client.js`.
5. If the task touches performance, preserve the stable optimizations already on branch.
6. Prefer atomic commits and validate with `npm run build` or `npm run build:web`.
