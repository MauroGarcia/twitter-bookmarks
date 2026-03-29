import path from 'path'

process.env.TEST_DB = 'true'

async function seed() {
  console.log('Seeding public mock bookmarks into test SQLite...')

  const { importBookmarks } = await import('../../src/electron/twitter-importer.js')
  const { initDb, getBookmarks, getStats } = await import('../../src/electron/db.js')

  initDb()

  const filePath = path.join(process.cwd(), 'tests', 'manual', 'mock-public-bookmarks.js')
  const imported = await importBookmarks(filePath)
  const bookmarks = getBookmarks({ limit: 100, offset: 0 })
  const stats = getStats()

  console.log(`Imported: ${imported}`)
  console.log(`Bookmarks in DB: ${bookmarks.length}`)
  console.log(`Stats: ${JSON.stringify(stats)}`)

  if (bookmarks.length > 0) {
    const first = bookmarks[0]
    console.log(`Latest bookmark: ${first.author_handle} :: ${first.tweet_url}`)
  }
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
