# CLAUDE.md

This file gives Claude Code a fast, current map of the repository.

## Project Summary

Twitter Bookmarks is an Electron application that imports, indexes, searches and organizes Twitter/X bookmarks locally. Data stays on the machine and is stored in SQLite.

## Canonical Code Paths

- `src/shared/` is the main implementation for UI, store and reusable logic.
- `src/renderer/` is the Electron renderer entry and still contains some historical duplication.
- `src/web/` is the web entry for the shared UI.
- `src/electron/` owns SQLite, import flow and IPC handlers.
- `src/preload/` exposes the safe bridge used by the renderer.

When changing UI or state behavior, inspect `src/shared/*` first and verify whether mirrored `src/renderer/*` files also need attention.

## Runtime Architecture

- Main process: `src/electron/index.js`
- IPC handlers: `src/electron/ipc-handlers.js`
- Database and search queries: `src/electron/db.js`
- Shared app shell: `src/shared/App.jsx`
- Shared store: `src/shared/store/appStore.js`
- Main search UI: `src/shared/components/SearchBar.jsx`
- Main result list: `src/shared/components/BookmarkList.jsx`

Data flow is: React component -> shared store -> API facade -> preload bridge -> IPC handler -> SQLite -> back to store -> render.

## Search Stack

- Full-text search uses SQLite FTS5 in `bookmarks_fts`.
- Structured tag filters use normalized `tags.name_normalized`.
- Structured author filters use normalized `bookmarks.author_handle_normalized`.
- Search suggestions for `#tag` and `@author` are indexed client-side in `src/shared/components/SearchBar.jsx`.
- Bookmark fetch/pagination/cache orchestration lives in `src/shared/store/appStore.js`.

## Current Performance State

Stable improvements already on branch:

- indexed client-side suggestions for tag/author chips
- normalized/indexed SQLite filters for tags and authors
- stable bookmark card variants derived from `bookmark.id`

Known next targets:

- virtualize or window the bookmark list
- keep render cost low without hurting perceived search latency
- reduce mock-data filtering cost for larger datasets

A previous experiment that precomputed bookmark card text/date render data was intentionally removed from the branch and stored in stash for comparison. Do not assume that optimization is active.

## Working Rules For This Repo

- Prefer edits in `src/shared/*` unless the task is entry-specific.
- Be careful with duplicated files under `src/renderer/*`; confirm whether they are still used before editing both trees.
- Database migrations belong in `initDb()` inside `src/electron/db.js`.
- Renderer code must not access Node APIs directly; all file/DB work goes through IPC.
- Zustand is the source of truth for global UI state.

## Useful Commands

```bash
npm install --legacy-peer-deps
npm run dev
npm run dev:web
npm run build
npm run build:web
npm run db:doctor
npm run db:query -- "SELECT id, name FROM tags ORDER BY name"
npm run seed:mock
```

## Database Operations

- Prefer `npm run db:doctor` for a quick integrity and anomaly snapshot of the local SQLite database.
- Prefer `npm run db:query -- "<SQL>"` for direct inspection or one-off SQL fixes.
- These commands use the Electron runtime, which avoids the `better-sqlite3` ABI mismatch you may hit with the system `node`.

## LLM Context Files

- `README.md` for human-facing overview
- `CODEX.md` for Codex-oriented repository guidance
- `.agents/skills/twitter-bookmarks-context/SKILL.md` for compact project context
- `.agents/skills/e2e-testing-patterns/SKILL.md` for E2E patterns reference

Last updated: 2026-04-01
