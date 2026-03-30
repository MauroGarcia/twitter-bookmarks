const { app } = require('electron')
const Database = require('better-sqlite3')
const os = require('os')
const path = require('path')

app.whenReady().then(() => {
  const db = new Database(path.join(os.homedir(), 'AppData', 'Local', 'twitter-bookmarks', 'bookmarks.db'))

  const rows = db.prepare(`
    SELECT id, author_handle, full_text, media_urls, urls, raw_json
    FROM bookmarks
    WHERE author_handle IN ('bloggersarvesh', 'Vtrivedy10')
    ORDER BY created_at DESC
    LIMIT 10
  `).all()

  console.log(JSON.stringify(rows, null, 2))
  app.exit(0)
})
