const { app } = require('electron')
const Database = require('better-sqlite3')
const os = require('os')
const path = require('path')

const DB_PATH = process.env.TWITTER_BOOKMARKS_DB_PATH
  || path.join(os.homedir(), 'AppData', 'Local', 'twitter-bookmarks', 'bookmarks.db')

function printUsage() {
  console.log(`Usage:
  electron scripts/db-tool.cjs doctor
  electron scripts/db-tool.cjs query "SELECT * FROM tags ORDER BY name"

Commands:
  doctor    Print basic database health and integrity metrics
  query     Run a single SQL query or statement against the local SQLite database`)
}

function createDb() {
  return new Database(DB_PATH)
}

function runDoctor(db) {
  const counts = {
    bookmarks: db.prepare('SELECT COUNT(*) AS count FROM bookmarks').get().count,
    tags: db.prepare('SELECT COUNT(*) AS count FROM tags').get().count,
    bookmarkTags: db.prepare('SELECT COUNT(*) AS count FROM bookmark_tags').get().count,
    notes: db.prepare('SELECT COUNT(*) AS count FROM notes').get().count,
    favorites: db.prepare('SELECT COUNT(*) AS count FROM bookmarks WHERE is_favorite = 1').get().count,
    archived: db.prepare('SELECT COUNT(*) AS count FROM bookmarks WHERE is_archived = 1').get().count
  }

  const integrity = db.prepare('PRAGMA integrity_check').all()
  const anomalies = {
    bookmarksMissingAuthorNormalized: db.prepare(`
      SELECT COUNT(*) AS count
      FROM bookmarks
      WHERE author_handle_normalized IS NULL
         OR author_handle_normalized <> LOWER(TRIM(COALESCE(author_handle, '')))
    `).get().count,
    tagsMissingNameNormalized: db.prepare(`
      SELECT COUNT(*) AS count
      FROM tags
      WHERE name_normalized IS NULL
         OR name_normalized <> LOWER(TRIM(COALESCE(name, '')))
    `).get().count,
    orphanedBookmarkTagLinks: db.prepare(`
      SELECT COUNT(*) AS count
      FROM bookmark_tags bt
      LEFT JOIN bookmarks b ON b.id = bt.bookmark_id
      LEFT JOIN tags t ON t.id = bt.tag_id
      WHERE b.id IS NULL OR t.id IS NULL
    `).get().count,
    orphanedNotes: db.prepare(`
      SELECT COUNT(*) AS count
      FROM notes n
      LEFT JOIN bookmarks b ON b.id = n.bookmark_id
      WHERE b.id IS NULL
    `).get().count
  }

  console.log(JSON.stringify({
    dbPath: DB_PATH,
    integrity,
    counts,
    anomalies
  }, null, 2))
}

function runQuery(db, sql) {
  const normalizedSql = `${sql || ''}`.trim()

  if (!normalizedSql) {
    throw new Error('SQL obrigatorio. Exemplo: npm run db:query -- "SELECT * FROM tags"')
  }

  const sqlWithoutTrailingSemicolons = normalizedSql.replace(/;+\s*$/, '')
  const hasMultipleStatements = sqlWithoutTrailingSemicolons.includes(';')

  if (hasMultipleStatements) {
    db.exec(normalizedSql)
    console.log(JSON.stringify({
      dbPath: DB_PATH,
      mode: 'exec',
      ok: true
    }, null, 2))
    return
  }

  const stmt = db.prepare(sqlWithoutTrailingSemicolons)

  if (stmt.reader) {
    const rows = stmt.all()
    console.log(JSON.stringify({
      dbPath: DB_PATH,
      mode: 'read',
      rowCount: rows.length,
      rows
    }, null, 2))
    return
  }

  const result = stmt.run()
  console.log(JSON.stringify({
    dbPath: DB_PATH,
    mode: 'write',
    changes: result.changes,
    lastInsertRowid: result.lastInsertRowid
  }, null, 2))
}

app.whenReady().then(() => {
  const [, , command, ...rest] = process.argv

  try {
    if (!command || command === '--help' || command === '-h') {
      printUsage()
      app.exit(0)
      return
    }

    const db = createDb()

    if (command === 'doctor') {
      runDoctor(db)
    } else if (command === 'query') {
      runQuery(db, rest.join(' '))
    } else {
      throw new Error(`Comando desconhecido: ${command}`)
    }

    db.close()
    app.exit(0)
  } catch (error) {
    console.error(error.message)
    app.exit(1)
  }
})
