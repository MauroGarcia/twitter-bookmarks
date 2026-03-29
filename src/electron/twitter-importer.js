import fs from 'fs'
import * as db from './db.js'
import { parseTwitterBookmarksExport } from '../shared/lib/twitter-bookmarks-import.js'

export async function importBookmarks(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const data = parseTwitterBookmarksExport(raw)

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
