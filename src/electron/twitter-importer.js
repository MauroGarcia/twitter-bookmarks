import fs from 'fs'
import * as db from './db.js'

export async function importBookmarks(filePath) {
  // Ler o arquivo
  const raw = fs.readFileSync(filePath, 'utf8')

  // Remover o prefixo "window.YTD.bookmarks.part0 = "
  const jsonStr = raw.replace(/^window\.YTD\.bookmarks\.part\d+ = /, '').trim()

  // Parse JSON
  let data
  try {
    data = JSON.parse(jsonStr)
  } catch (error) {
    throw new Error(`Erro ao fazer parse do JSON: ${error.message}`)
  }

  // Garantir que é um array
  if (!Array.isArray(data)) {
    throw new Error('Formato de arquivo inválido')
  }

  // Usar transaction para garantir integridade dos dados
  // Se algo falhar no meio do import, tudo é revertido
  const insertInTransaction = db.default.transaction(() => {
    let count = 0

    for (const item of data) {
      if (!item.tweet) continue

      const tweet = item.tweet

      // Extrair dados relevantes
      const id = tweet.id
      const fullText = tweet.full_text || ''
      const tweetUrl = `https://twitter.com/${tweet.user?.screen_name}/status/${id}`

      // Ignorar se já existe
      const existing = db.getBookmarkById(id)
      if (existing) continue

      try {
        db.createBookmark({
          id,
          tweet_url: tweetUrl,
          full_text: fullText,
          author_name: tweet.user?.name || 'Unknown',
          author_handle: tweet.user?.screen_name || 'unknown',
          author_avatar_url: tweet.user?.profile_image_url_https || null,
          created_at: tweet.created_at || new Date().toISOString(),
          imported_at: new Date().toISOString(),
          like_count: tweet.favorite_count || 0,
          retweet_count: tweet.retweet_count || 0,
          has_media: (tweet.extended_entities?.media?.length ?? 0) > 0,
          media_urls: tweet.extended_entities?.media?.map(m => m.media_url_https) || null,
          urls: tweet.entities?.urls?.map(u => ({ url: u.url, expanded_url: u.expanded_url })) || null,
          raw_json: tweet
        })

        count++
      } catch (error) {
        // Se houver erro, a transaction será abortada automaticamente
        throw new Error(`Erro ao inserir tweet ${id}: ${error.message}`)
      }
    }

    return count
  })

  // Executar a transaction
  return insertInTransaction()
}

export default importBookmarks
