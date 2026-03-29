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
  }
}

export function normalizeBookmarks(bookmarks = []) {
  return bookmarks.map(normalizeBookmark)
}
