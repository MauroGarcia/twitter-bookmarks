import Database from 'better-sqlite3'
import path from 'path'
import os from 'os'
import fs from 'fs'

const DB_DIR = path.join(os.homedir(), 'AppData', 'Local', 'twitter-bookmarks')
const DB_PATH = path.join(DB_DIR, 'bookmarks.db')

// Criar diretório se não existir
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

// ============ SCHEMA ============
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      tweet_url TEXT NOT NULL,
      full_text TEXT NOT NULL,
      author_name TEXT,
      author_handle TEXT,
      author_avatar_url TEXT,
      created_at TEXT,
      imported_at TEXT NOT NULL,
      like_count INTEGER DEFAULT 0,
      retweet_count INTEGER DEFAULT 0,
      has_media INTEGER DEFAULT 0,
      media_urls TEXT,
      urls TEXT,
      raw_json TEXT
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
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
  `)
}

// ============ BOOKMARKS ============
export function getBookmarks(filters = {}) {
  const { tag, search, author, limit = 20, offset = 0 } = filters

  let query = `
    SELECT DISTINCT b.* FROM bookmarks b
    LEFT JOIN bookmark_tags bt ON b.id = bt.bookmark_id
    LEFT JOIN tags t ON bt.tag_id = t.id
    WHERE 1=1
  `
  const params = []

  if (tag) {
    query += ` AND t.name = ?`
    params.push(tag)
  }

  if (author) {
    query += ` AND (b.author_handle LIKE ? OR b.author_name LIKE ?)`
    params.push(`%${author}%`, `%${author}%`)
  }

  if (search) {
    query += ` AND EXISTS (
      SELECT 1 FROM bookmarks_fts WHERE bookmarks_fts.id = b.id
      AND bookmarks_fts MATCH ?
    )`
    params.push(search)
  }

  query += ` ORDER BY b.created_at DESC LIMIT ? OFFSET ?`
  params.push(limit, offset)

  const stmt = db.prepare(query)
  return stmt.all(...params)
}

export function getBookmarkById(id) {
  const stmt = db.prepare('SELECT * FROM bookmarks WHERE id = ?')
  return stmt.get(id)
}

export function createBookmark(bookmark) {
  const stmt = db.prepare(`
    INSERT INTO bookmarks (
      id, tweet_url, full_text, author_name, author_handle,
      author_avatar_url, created_at, imported_at, like_count,
      retweet_count, has_media, media_urls, urls, raw_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  return stmt.run(
    bookmark.id,
    bookmark.tweet_url,
    bookmark.full_text,
    bookmark.author_name,
    bookmark.author_handle,
    bookmark.author_avatar_url,
    bookmark.created_at,
    bookmark.imported_at,
    bookmark.like_count || 0,
    bookmark.retweet_count || 0,
    bookmark.has_media ? 1 : 0,
    bookmark.media_urls ? JSON.stringify(bookmark.media_urls) : null,
    bookmark.urls ? JSON.stringify(bookmark.urls) : null,
    bookmark.raw_json ? JSON.stringify(bookmark.raw_json) : null
  )
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

export function getTagById(id) {
  const stmt = db.prepare('SELECT * FROM tags WHERE id = ?')
  return stmt.get(id)
}

export function createTag(name, color = '#6366f1') {
  const stmt = db.prepare(`
    INSERT INTO tags (name, color, created_at)
    VALUES (?, ?, ?)
  `)
  return stmt.run(name, color, new Date().toISOString())
}

export function updateTag(id, { name, color }) {
  const stmt = db.prepare(`
    UPDATE tags SET name = ?, color = ? WHERE id = ?
  `)
  return stmt.run(name, color, id)
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
  const { tag, search, author, limit = 20, offset = 0 } = filters

  // Primeira query: obter bookmarks
  const bookmarks = getBookmarks(filters)

  // Segunda query: obter todas as tags de uma vez (muito mais eficiente)
  const bookmarkIds = bookmarks.map(b => b.id)

  if (bookmarkIds.length === 0) {
    return bookmarks.map(b => ({ ...b, tags: [] }))
  }

  // Usar IN clause para pegar todas as tags em uma única query
  const placeholders = bookmarkIds.map(() => '?').join(',')
  const stmt = db.prepare(`
    SELECT bt.bookmark_id, t.id, t.name, t.color, t.created_at
    FROM bookmark_tags bt
    INNER JOIN tags t ON bt.tag_id = t.id
    WHERE bt.bookmark_id IN (${placeholders})
  `)

  const allTags = stmt.all(...bookmarkIds)

  // Agrupar tags por bookmark_id
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

  // Retornar bookmarks com tags associadas
  return bookmarks.map(b => ({
    ...b,
    tags: tagsMap[b.id] || []
  }))
}

// ============ STATS ============
export function getStats() {
  const bookmarksCount = db.prepare('SELECT COUNT(*) as count FROM bookmarks').get().count
  const tagsCount = db.prepare('SELECT COUNT(*) as count FROM tags').get().count
  const notesCount = db.prepare('SELECT COUNT(*) as count FROM notes').get().count

  return { bookmarksCount, tagsCount, notesCount }
}

export default db
