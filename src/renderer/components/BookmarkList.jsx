import { BookmarkCard } from './BookmarkCard'
import { useAppStore } from '../store/appStore'

export function BookmarkList({ onSelectBookmark }) {
  const { bookmarks, isLoading } = useAppStore()

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
          tags={bookmark.tags || []}
          onClick={() => onSelectBookmark(bookmark)}
        />
      ))}
    </div>
  )
}
