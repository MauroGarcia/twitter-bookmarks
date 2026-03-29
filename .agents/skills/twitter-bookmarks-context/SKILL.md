---
name: twitter-bookmarks-context
description: Use when working in this repository to quickly understand the canonical code paths, search stack, duplicated shared/renderer layout, and current performance status before making changes.
---

# Twitter Bookmarks Context

Use this skill at the start of work in this repository when you need fast project context.

## Canonical paths

- `src/shared/` is the main implementation for UI, store and reusable logic.
- `src/renderer/` is the Electron renderer entry and still has some historical duplication.
- `src/web/` is the web entry for the shared UI.
- `src/electron/` owns SQLite, import and IPC.
- `src/preload/` exposes the safe renderer bridge.

## Search map

- Main search UI: `src/shared/components/SearchBar.jsx`
- Main result list: `src/shared/components/BookmarkList.jsx`
- Shared store: `src/shared/store/appStore.js`
- SQLite queries and migrations: `src/electron/db.js`

## Current stable performance work

- client-side indexed suggestions for `#tag` and `@author`
- normalized/indexed SQLite filters for structured tag/author queries
- stable bookmark card variants derived from `bookmark.id`

## Current caution points

- the bookmark list is not virtualized yet
- renderer and shared trees may drift; verify before editing both
- a precompute bookmark render-data experiment was intentionally removed and kept in stash only

## Recommended workflow

1. Inspect `src/shared/*` first.
2. Confirm whether mirrored renderer files also need changes.
3. If the task touches search, review `SearchBar`, `appStore`, and `db.js` together.
4. If the task touches performance, preserve the stable optimizations already on branch.
5. Prefer atomic commits and validate with `npm run build` or `npm run build:web`.
