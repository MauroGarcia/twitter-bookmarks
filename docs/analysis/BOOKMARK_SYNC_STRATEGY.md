# Bookmark Import + Sync Strategy

## Goal

Combine a reliable historical import path with an incremental sync path for recent bookmarks.

## Recommended Model

### 1. Bootstrap with `bookmarks.js`

- User exports their X archive and imports `data/bookmarks.js`
- This populates the initial SQLite history
- This is the most reliable path for long-term historical coverage

### 2. Connect with X for incremental sync

- Add a `Conectar com X` flow in the desktop app
- Use OAuth 2.0 PKCE for user authentication
- Store user tokens securely
- Fetch the authenticated user id and use the Bookmarks API

### 3. Sync only recent bookmarks from the API

- Use the X API bookmarks lookup for incremental updates
- Fetch the newest bookmarks with pagination
- Insert only new bookmarks or update mutable metadata
- Do not treat the API as the sole source of historical truth

## Why this model

- `bookmarks.js` gives a durable historical bootstrap
- API sync keeps the library fresh after the initial import
- If X changes access limits, pricing, or API behavior, the app still retains a local historical base

## Data handling guidance

- Keep imported history even if the API no longer returns an older bookmark
- Track bookmark provenance with a field such as `source = export | api`
- Track sync metadata such as `last_synced_at` and `api_last_seen_at`
- Prefer upsert behavior by bookmark id

## Suggested UX

- `Importar bookmarks.js` for first-time historical import
- `Conectar com X` for account linking
- `Sincronizar agora` for manual refresh
- Sync status feedback such as `23 bookmarks novos importados`

## Practical rule

- `bookmarks.js` = source of historical bootstrap
- X API = source of incremental sync for recent items

This avoids relying on the API as a complete archive.
