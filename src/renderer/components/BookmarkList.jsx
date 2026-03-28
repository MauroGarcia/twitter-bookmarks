import { useEffect, useState } from 'react'
import { BookmarkCard } from './BookmarkCard'
import { useAppStore } from '../store/appStore'

export function BookmarkList({ onSelectBookmark }) {
  const { bookmarks, isLoading } = useAppStore()
  const [bookmarkTags, setBookmarkTags] = useState({})

  // Carregar tags para cada bookmark quando a lista muda
  useEffect(() => {
    const loadAllTags = async () => {
      const tags = {}
      for (const bookmark of bookmarks) {
        try {
          tags[bookmark.id] = await window.api.getBookmarkTags(bookmark.id)
        } catch (error) {
          console.error('Erro ao carregar tags do bookmark:', error)
          tags[bookmark.id] = []
        }
      }
      setBookmarkTags(tags)
    }
    if (bookmarks.length > 0) {
      loadAllTags()
    }
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
