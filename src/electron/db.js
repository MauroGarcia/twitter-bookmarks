import Database from 'better-sqlite3'
import path from 'path'
import os from 'os'
import fs from 'fs'

const isTestDb = process.env.TEST_DB === 'true'
const DB_DIR = isTestDb
  ? path.join(process.cwd(), 'tests', '.tmp')
  : path.join(os.homedir(), 'AppData', 'Local', 'twitter-bookmarks')
const DB_PATH = isTestDb
  ? path.join(DB_DIR, 'bookmarks.test.db')
  : path.join(DB_DIR, 'bookmarks.db')

// Criar diretório se não existir
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

function escapeLike(value) {
  return `${value}`.replace(/[\\%_]/g, '\\$&')
}

function normalizeLookupValue(value) {
  return `${value}`.trim().toLowerCase()
}

function buildFtsMatchQuery(value) {
  const tokens = `${value}`
    .trim()
    .toLowerCase()
    .match(/[^\s"']+/g)

  if (!tokens || tokens.length === 0) {
    return null
  }

  return tokens
    .map((token) => token.replace(/"/g, '""'))
    .filter(Boolean)
    .map((token) => `"${token}"*`)
    .join(' AND ')
}

function normalizePagination(filters = {}) {
  const limit = Number.isFinite(Number(filters.limit)) ? Math.max(1, Number(filters.limit)) : 20
  const offset = Number.isFinite(Number(filters.offset)) ? Math.max(0, Number(filters.offset)) : 0

  return { limit, offset }
}

function buildBookmarksQueryParts(filters = {}) {
  const { tag, tags = [], search, author, authors = [], view = 'all' } = filters
  const params = []
  const joins = []
  const conditions = []
  const requestedTags = [...new Set([tag, ...tags].filter(Boolean).map(normalizeLookupValue))]
  const requestedAuthors = [...new Set([author, ...authors].filter(Boolean).map(normalizeLookupValue))]

  if (requestedTags.length > 0) {
    requestedTags.forEach((tagName, index) => {
      conditions.push(`
        EXISTS (
          SELECT 1
          FROM bookmark_tags bt${index}
          INNER JOIN tags t${index} ON bt${index}.tag_id = t${index}.id
          WHERE bt${index}.bookmark_id = b.id
            AND t${index}.name_normalized = ?
        )
      `)
      params.push(tagName)
    })
  }

  if (requestedAuthors.length > 0) {
    const authorConditions = requestedAuthors.map(() => 'b.author_handle_normalized = ?')
    conditions.push(`(${authorConditions.join(' OR ')})`)
    requestedAuthors.forEach((currentAuthor) => {
      params.push(currentAuthor)
    })
  }

  if (search) {
    const matchQuery = buildFtsMatchQuery(search)

    if (matchQuery) {
      joins.push('INNER JOIN bookmarks_fts ON bookmarks_fts.rowid = b.rowid')
      conditions.push('bookmarks_fts MATCH ?')
      params.push(matchQuery)
    }
  }

  if (view === 'favorites') {
    conditions.push('b.is_favorite = 1')
    conditions.push('b.is_archived = 0')
  } else if (view === 'archived') {
    conditions.push('b.is_archived = 1')
  } else {
    conditions.push('b.is_archived = 0')
  }

  return { joins, conditions, params }
}

function buildBookmarksSelectQuery(filters = {}) {
  const { joins, conditions, params } = buildBookmarksQueryParts(filters)
  const { limit, offset } = normalizePagination(filters)

  let query = 'SELECT b.* FROM bookmarks b'

  if (joins.length > 0) {
    query += ` ${joins.join(' ')}`
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`
  }

  query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?'

  return {
    query,
    params: [...params, limit, offset],
    limit,
    offset
  }
}

function countBookmarks(filters = {}) {
  const { joins, conditions, params } = buildBookmarksQueryParts(filters)
  let query = 'SELECT COUNT(DISTINCT b.id) as count FROM bookmarks b'

  if (joins.length > 0) {
    query += ` ${joins.join(' ')}`
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`
  }

  return db.prepare(query).get(...params).count
}

function ensureBookmarkColumn(columnName, definition) {
  const columns = db.prepare('PRAGMA table_info(bookmarks)').all()

  if (!columns.some((column) => column.name === columnName)) {
    db.exec(`ALTER TABLE bookmarks ADD COLUMN ${columnName} ${definition}`)
  }
}

function ensureBookmarkJsonColumn(columnName) {
  ensureBookmarkColumn(columnName, 'TEXT')
}

function ensureTagColumn(columnName, definition) {
  const columns = db.prepare('PRAGMA table_info(tags)').all()

  if (!columns.some((column) => column.name === columnName)) {
    db.exec(`ALTER TABLE tags ADD COLUMN ${columnName} ${definition}`)
  }
}

// ============ SCHEMA ============
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      tweet_url TEXT NOT NULL,
      full_text TEXT NOT NULL,
      author_name TEXT,
      author_handle TEXT,
      author_handle_normalized TEXT,
      author_avatar_url TEXT,
      created_at TEXT,
      imported_at TEXT NOT NULL,
      like_count INTEGER DEFAULT 0,
      retweet_count INTEGER DEFAULT 0,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      is_archived INTEGER NOT NULL DEFAULT 0,
      has_media INTEGER DEFAULT 0,
      media_urls TEXT,
      urls TEXT,
      article_data TEXT,
      quoted_tweet TEXT,
      raw_json TEXT
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      name_normalized TEXT,
      color TEXT NOT NULL DEFAULT '#6366f1',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookmark_tags (
      bookmark_id TEXT NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (bookmark_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bookmark_id TEXT NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS bookmarks_fts USING fts5(
      id UNINDEXED, full_text, author_name, author_handle,
      content='bookmarks', content_rowid='rowid'
    );

    CREATE TRIGGER IF NOT EXISTS bookmarks_ai AFTER INSERT ON bookmarks BEGIN
      INSERT INTO bookmarks_fts(rowid, id, full_text, author_name, author_handle)
      VALUES (new.rowid, new.id, new.full_text, new.author_name, new.author_handle);
    END;

    CREATE TRIGGER IF NOT EXISTS bookmarks_ad AFTER DELETE ON bookmarks BEGIN
      DELETE FROM bookmarks_fts WHERE id = old.id;
    END;

    CREATE TRIGGER IF NOT EXISTS bookmarks_au AFTER UPDATE ON bookmarks BEGIN
      UPDATE bookmarks_fts
      SET full_text = new.full_text,
          author_name = new.author_name,
          author_handle = new.author_handle
      WHERE rowid = new.rowid;
    END;

    CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_bookmark_tags_bookmark_id ON bookmark_tags(bookmark_id);
    CREATE INDEX IF NOT EXISTS idx_bookmark_tags_tag_id_bookmark_id ON bookmark_tags(tag_id, bookmark_id);
    CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
  `)

  ensureBookmarkColumn('is_favorite', 'INTEGER NOT NULL DEFAULT 0')
  ensureBookmarkColumn('is_archived', 'INTEGER NOT NULL DEFAULT 0')
  ensureBookmarkColumn('author_handle_normalized', 'TEXT')
  ensureBookmarkJsonColumn('article_data')
  ensureBookmarkJsonColumn('quoted_tweet')
  ensureTagColumn('name_normalized', 'TEXT')
  db.exec(`
    UPDATE bookmarks
    SET author_handle_normalized = LOWER(TRIM(COALESCE(author_handle, '')))
    WHERE author_handle_normalized IS NULL
       OR author_handle_normalized <> LOWER(TRIM(COALESCE(author_handle, '')));

    UPDATE tags
    SET name_normalized = LOWER(TRIM(COALESCE(name, '')))
    WHERE name_normalized IS NULL
       OR name_normalized <> LOWER(TRIM(COALESCE(name, '')));
  `)
  db.exec('CREATE INDEX IF NOT EXISTS idx_bookmarks_status_created_at ON bookmarks(is_archived, is_favorite, created_at DESC)')
  db.exec('CREATE INDEX IF NOT EXISTS idx_bookmarks_author_handle_normalized ON bookmarks(author_handle_normalized)')
  db.exec('CREATE INDEX IF NOT EXISTS idx_tags_name_normalized ON tags(name_normalized)')
}

// ============ BOOKMARKS ============
export function getBookmarks(filters = {}) {
  const { query, params } = buildBookmarksSelectQuery(filters)
  return db.prepare(query).all(...params)
}

export function getBookmarkById(id) {
  const stmt = db.prepare('SELECT * FROM bookmarks WHERE id = ?')
  return stmt.get(id)
}

export function createBookmark(bookmark) {
  const stmt = db.prepare(`
    INSERT INTO bookmarks (
      id, tweet_url, full_text, author_name, author_handle, author_handle_normalized,
      author_avatar_url, created_at, imported_at, like_count,
      retweet_count, is_favorite, is_archived, has_media, media_urls, urls, article_data, quoted_tweet, raw_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  return stmt.run(
    bookmark.id,
    bookmark.tweet_url,
    bookmark.full_text,
    bookmark.author_name,
    bookmark.author_handle,
    normalizeLookupValue(bookmark.author_handle),
    bookmark.author_avatar_url,
    bookmark.created_at,
    bookmark.imported_at,
    bookmark.like_count || 0,
    bookmark.retweet_count || 0,
    bookmark.is_favorite ? 1 : 0,
    bookmark.is_archived ? 1 : 0,
    bookmark.has_media ? 1 : 0,
    bookmark.media_urls ? JSON.stringify(bookmark.media_urls) : null,
    bookmark.urls ? JSON.stringify(bookmark.urls) : null,
    bookmark.article_data ? JSON.stringify(bookmark.article_data) : null,
    bookmark.quoted_tweet ? JSON.stringify(bookmark.quoted_tweet) : null,
    bookmark.raw_json ? JSON.stringify(bookmark.raw_json) : null
  )
}

export function upsertBookmark(bookmark) {
  const stmt = db.prepare(`
    INSERT INTO bookmarks (
      id, tweet_url, full_text, author_name, author_handle, author_handle_normalized,
      author_avatar_url, created_at, imported_at, like_count,
      retweet_count, is_favorite, is_archived, has_media, media_urls, urls, article_data, quoted_tweet, raw_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      tweet_url = excluded.tweet_url,
      full_text = excluded.full_text,
      author_name = excluded.author_name,
      author_handle = excluded.author_handle,
      author_handle_normalized = excluded.author_handle_normalized,
      author_avatar_url = excluded.author_avatar_url,
      created_at = excluded.created_at,
      like_count = excluded.like_count,
      retweet_count = excluded.retweet_count,
      has_media = excluded.has_media,
      media_urls = excluded.media_urls,
      urls = excluded.urls,
      article_data = excluded.article_data,
      quoted_tweet = excluded.quoted_tweet,
      raw_json = excluded.raw_json
  `)

  return stmt.run(
    bookmark.id,
    bookmark.tweet_url,
    bookmark.full_text,
    bookmark.author_name,
    bookmark.author_handle,
    normalizeLookupValue(bookmark.author_handle),
    bookmark.author_avatar_url,
    bookmark.created_at,
    bookmark.imported_at,
    bookmark.like_count || 0,
    bookmark.retweet_count || 0,
    bookmark.is_favorite ? 1 : 0,
    bookmark.is_archived ? 1 : 0,
    bookmark.has_media ? 1 : 0,
    bookmark.media_urls ? JSON.stringify(bookmark.media_urls) : null,
    bookmark.urls ? JSON.stringify(bookmark.urls) : null,
    bookmark.article_data ? JSON.stringify(bookmark.article_data) : null,
    bookmark.quoted_tweet ? JSON.stringify(bookmark.quoted_tweet) : null,
    bookmark.raw_json ? JSON.stringify(bookmark.raw_json) : null
  )
}

export function setBookmarkFavorite(id, isFavorite) {
  return db.prepare('UPDATE bookmarks SET is_favorite = ? WHERE id = ?').run(isFavorite ? 1 : 0, id)
}

export function setBookmarkArchived(id, isArchived) {
  return db.prepare('UPDATE bookmarks SET is_archived = ? WHERE id = ?').run(isArchived ? 1 : 0, id)
}

export function deleteBookmark(id) {
  const stmt = db.prepare('DELETE FROM bookmarks WHERE id = ?')
  return stmt.run(id)
}

// ============ TAGS ============
export function getAllTags() {
  const stmt = db.prepare(`
    SELECT t.*, COUNT(bt.bookmark_id) as count
    FROM tags t
    LEFT JOIN bookmark_tags bt ON t.id = bt.tag_id
    GROUP BY t.id
    ORDER BY t.name ASC
  `)
  return stmt.all()
}

export function getAllAuthors() {
  const stmt = db.prepare(`
    SELECT
      author_handle AS handle,
      author_name AS name,
      COUNT(*) AS count
    FROM bookmarks
    WHERE author_handle IS NOT NULL
      AND TRIM(author_handle) <> ''
      AND is_archived = 0
    GROUP BY author_handle, author_name
    ORDER BY count DESC, author_handle ASC
  `)

  return stmt.all()
}

export function getTagById(id) {
  const stmt = db.prepare('SELECT * FROM tags WHERE id = ?')
  return stmt.get(id)
}

export function getTagByName(name) {
  const stmt = db.prepare('SELECT * FROM tags WHERE name_normalized = ?')
  return stmt.get(normalizeLookupValue(name))
}

export function createTag(name, color = '#6366f1') {
  const stmt = db.prepare(`
    INSERT INTO tags (name, name_normalized, color, created_at)
    VALUES (?, ?, ?, ?)
  `)
  return stmt.run(name, normalizeLookupValue(name), color, new Date().toISOString())
}

export function updateTag(id, { name, color }) {
  const stmt = db.prepare(`
    UPDATE tags SET name = ?, name_normalized = ?, color = ? WHERE id = ?
  `)
  return stmt.run(name, normalizeLookupValue(name), color, id)
}

export function deleteTag(id) {
  const stmt = db.prepare('DELETE FROM tags WHERE id = ?')
  return stmt.run(id)
}

// ============ BOOKMARK_TAGS ============
export function getBookmarkTags(bookmarkId) {
  const stmt = db.prepare(`
    SELECT t.* FROM tags t
    INNER JOIN bookmark_tags bt ON t.id = bt.tag_id
    WHERE bt.bookmark_id = ?
  `)
  return stmt.all(bookmarkId)
}

export function setBookmarkTags(bookmarkId, tagIds) {
  // Limpar tags existentes
  const deleteStmt = db.prepare('DELETE FROM bookmark_tags WHERE bookmark_id = ?')
  deleteStmt.run(bookmarkId)

  // Inserir novas tags
  const insertStmt = db.prepare(`
    INSERT INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)
  `)

  for (const tagId of tagIds) {
    insertStmt.run(bookmarkId, tagId)
  }
}

// ============ NOTES ============
export function getNote(bookmarkId) {
  const stmt = db.prepare(`
    SELECT * FROM notes WHERE bookmark_id = ? ORDER BY updated_at DESC LIMIT 1
  `)
  return stmt.get(bookmarkId)
}

export function upsertNote(bookmarkId, content) {
  const now = new Date().toISOString()

  const existing = db.prepare('SELECT id FROM notes WHERE bookmark_id = ? LIMIT 1').get(bookmarkId)

  if (existing) {
    const stmt = db.prepare(`
      UPDATE notes SET content = ?, updated_at = ? WHERE bookmark_id = ?
    `)
    return stmt.run(content, now, bookmarkId)
  } else {
    const stmt = db.prepare(`
      INSERT INTO notes (bookmark_id, content, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `)
    return stmt.run(bookmarkId, content, now, now)
  }
}

export function deleteNote(bookmarkId) {
  const stmt = db.prepare('DELETE FROM notes WHERE bookmark_id = ?')
  return stmt.run(bookmarkId)
}

// ============ BOOKMARKS WITH TAGS (Otimizado) ============
export function getBookmarksWithTags(filters = {}) {
  const { limit, offset } = normalizePagination(filters)
  const bookmarks = getBookmarks(filters)
  const total = countBookmarks(filters)

  const bookmarkIds = bookmarks.map(b => b.id)

  if (bookmarkIds.length === 0) {
    return {
      items: [],
      total,
      offset,
      limit,
      hasMore: false
    }
  }

  const placeholders = bookmarkIds.map(() => '?').join(',')
  const stmt = db.prepare(`
    SELECT bt.bookmark_id, t.id, t.name, t.color, t.created_at
    FROM bookmark_tags bt
    INNER JOIN tags t ON bt.tag_id = t.id
    WHERE bt.bookmark_id IN (${placeholders})
  `)

  const allTags = stmt.all(...bookmarkIds)

  const tagsMap = {}
  for (const record of allTags) {
    if (!tagsMap[record.bookmark_id]) {
      tagsMap[record.bookmark_id] = []
    }
    tagsMap[record.bookmark_id].push({
      id: record.id,
      name: record.name,
      color: record.color,
      created_at: record.created_at
    })
  }

  const items = bookmarks.map(b => ({
    ...b,
    tags: tagsMap[b.id] || []
  }))

  return {
    items,
    total,
    offset,
    limit,
    hasMore: offset + items.length < total
  }
}

// ============ STATS ============
export function getStats() {
  const bookmarksCount = db.prepare('SELECT COUNT(*) as count FROM bookmarks').get().count
  const tagsCount = db.prepare('SELECT COUNT(*) as count FROM tags').get().count
  const notesCount = db.prepare('SELECT COUNT(*) as count FROM notes').get().count
  const favoritesCount = db.prepare('SELECT COUNT(*) as count FROM bookmarks WHERE is_favorite = 1 AND is_archived = 0').get().count
  const archivedCount = db.prepare('SELECT COUNT(*) as count FROM bookmarks WHERE is_archived = 1').get().count

  return { bookmarksCount, tagsCount, notesCount, favoritesCount, archivedCount }
}

export default db
