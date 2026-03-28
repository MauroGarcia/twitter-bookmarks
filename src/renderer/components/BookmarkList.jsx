import { useEffect, useState } from 'react'
import { BookmarkCard } from './BookmarkCard'
import { useAppStore } from '../store/appStore'
import { useBookmarks } from '../hooks/useBookmarks'

export function BookmarkList({ onSelectBookmark }) {
  const { bookmarks, isLoading } = useAppStore()
  const { loadBookmarks } = useBookmarks()
  const [bookmarkTags, setBookmarkTags] = useState({})

  useEffect(() => {
    loadBookmarks()
  }, [])

  // Carregar tags para cada bookmark
  useEffect(() => {
    const loadAllTags = async () => {
      const tags = {}
      for (const bookmark of bookmarks) {
        tags[bookmark.id] = await window.api.getBookmarkTags(bookmark.id)
      }
      setBookmarkTags(tags)
    }
    loadAllTags()
  }, [bookmarks])

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Carregando...</div>
  }

  if (bookmarks.length === 0) {
    return <div className="text-center py-8 text-gray-500">Nenhum bookmark encontrado</div>
  }

  return (
    <div className="space-y-4">
      {bookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          tags={bookmarkTags[bookmark.id] || []}
          onClick={() => onSelectBookmark(bookmark)}
        />
      ))}
    </div>
  )
}
