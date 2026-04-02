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
- use `npm run db:doctor` for quick SQLite diagnostics
- use `npm run db:query -- "<SQL>"` for direct database inspection or one-off fixes
- avoid ad hoc Node DB scripts when `db:query` is enough, because `better-sqlite3` must run on the Electron runtime

## Windows Sandbox Note

- On this machine, harmless read-only commands can fail before execution with `windows sandbox: runner error: CreateProcessAsUserW failed: 5`.
- Treat that as a Windows runner launch restriction, not proof that the workspace itself is unreadable.
- Do not claim that "the sandbox is blocking simple workspace reads" unless an actual workspace read was denied after the command started.
- Prefer accurate wording: the command launch was blocked by the Windows sandbox, so use an approved command path first or request elevation for that specific read.
- If `rg`, `git`, `Get-Content`, or similar inspection commands fail with that runner error, request elevation only for the failing command and keep the scope narrow.
- See `docs/codex-windows-sandbox.md` for the repo-specific workflow.

## Extra Context

- `README.md` is the human overview
- `CLAUDE.md` is the fuller repository guide
- `.agents/skills/twitter-bookmarks-context/SKILL.md` is the compact reusable project context
