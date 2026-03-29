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

export function normalizeBookmark(bookmark) {
  const mediaUrls = parseBookmarkJsonList(bookmark.media_urls)
  const linkItems = parseBookmarkJsonList(bookmark.urls)

  return {
    ...bookmark,
    mediaUrls,
    linkItems,
    is_favorite: Boolean(bookmark.is_favorite),
    is_archived: Boolean(bookmark.is_archived),
  }
}

export function normalizeBookmarks(bookmarks = []) {
  return bookmarks.map(normalizeBookmark)
}
