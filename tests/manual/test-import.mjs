import path from 'path'

// Usar banco de testes
process.env.TEST_DB = 'true'

async function test() {
  console.log('🧪 Testando importação de bookmarks...\n')

  try {
    const { importBookmarks } = await import('../../src/electron/twitter-importer.js')
    const { initDb, getBookmarks, getStats } = await import('../../src/electron/db.js')

    // Inicializar BD
    initDb()
    console.log('✓ BD inicializado')

    // Importar do arquivo de teste
    const filePath = path.join(process.cwd(), 'tests', 'manual', 'test-bookmarks.js')
    const imported = await importBookmarks(filePath)
    console.log(`✓ ${imported} bookmarks importados\n`)

    // Verificar dados
    const bookmarks = getBookmarks({ limit: 100 })
    console.log(`📚 Total de bookmarks: ${bookmarks.length}`)

    if (bookmarks.length > 0) {
      console.log('\n📌 Primeiro bookmark:')
      const first = bookmarks[0]
      console.log(`  - Autor: ${first.author_name} (@${first.author_handle})`)
      console.log(`  - Texto: ${first.full_text.substring(0, 60)}...`)
      console.log(`  - Likes: ${first.like_count}`)
      console.log(`  - URL: ${first.tweet_url}`)
    }

    const stats = getStats()
    console.log(`\n📊 Stats:`)
    console.log(`  - Bookmarks: ${stats.bookmarksCount}`)
    console.log(`  - Tags: ${stats.tagsCount}`)
    console.log(`  - Notas: ${stats.notesCount}`)

    console.log('\n✅ Testes passaram!')
  } catch (error) {
    console.error('❌ Erro:', error.message)
    process.exit(1)
  }
}

test()
