export function parseBookmarkJsonList(value) {
  if (!value) return []

  if (Array.isArray(value)) return value

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function parseBookmarkJsonObject(value) {
  if (!value) return null

  if (typeof value === 'object' && !Array.isArray(value)) return value

  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function normalizeBookmark(bookmark) {
  const mediaUrls = parseBookmarkJsonList(bookmark.media_urls)
  const linkItems = parseBookmarkJsonList(bookmark.urls)
  const rawJson = parseBookmarkJsonObject(bookmark.raw_json)
  const parsedArticleData = parseBookmarkJsonObject(bookmark.article_data)
  const rawArticle = rawJson?.article
  const articleData = parsedArticleData || (rawArticle
    ? {
        title: rawArticle.title || '',
        text: rawArticle.plain_text || rawArticle.summary || rawArticle.preview_text || '',
        media_urls: [],
        links: Array.isArray(rawArticle.entities?.urls)
          ? rawArticle.entities.urls
            .map((item) => {
              if (typeof item === 'string') {
                return { href: item, label: item }
              }

              const href = item.text || item.url || item.expanded_url
              return href ? { href, label: item.display_url || href } : null
            })
            .filter(Boolean)
          : []
      }
    : null)
  const quotedTweet = parseBookmarkJsonObject(bookmark.quoted_tweet)

  return {
    ...bookmark,
    mediaUrls,
    linkItems,
    article_data: articleData,
    quoted_tweet: quotedTweet,
    is_favorite: Boolean(bookmark.is_favorite),
    is_archived: Boolean(bookmark.is_archived),
  }
}

export function normalizeBookmarks(bookmarks = []) {
  return bookmarks.map(normalizeBookmark)
}
