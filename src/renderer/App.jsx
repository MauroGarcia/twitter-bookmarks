import { useEffect, useState } from 'react'
import { useAppStore } from './store/appStore'
import { Sidebar } from './components/Sidebar'
import { SearchBar } from './components/SearchBar'
import { BookmarkList } from './components/BookmarkList'
import { ImportDialog } from './components/ImportDialog'
import { TweetDetail } from './components/TweetDetail'

export default function App() {
  const { selectedBookmark, setSelectedBookmark, setImportDialog, loadTags, loadStats } = useAppStore()
  const [selectedBookmarkTags, setSelectedBookmarkTags] = useState([])

  useEffect(() => {
    // Inicializar dados
    loadTags()
    loadStats()
  }, [])

  const handleSelectBookmark = async (bookmark) => {
    setSelectedBookmark(bookmark)
    try {
      const tags = await window.api.getBookmarkTags(bookmark.id)
      setSelectedBookmarkTags(tags)
    } catch (error) {
      console.error('Erro ao carregar tags do bookmark:', error)
    }
  }

  const handleCloseDetail = () => {
    setSelectedBookmark(null)
    setSelectedBookmarkTags([])
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onImport={() => setImportDialog(true)} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 bg-white border-b border-gray-200">
          <SearchBar />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <BookmarkList onSelectBookmark={handleSelectBookmark} />
        </div>
      </main>

      <ImportDialog />
      {selectedBookmark && (
        <TweetDetail
          bookmark={selectedBookmark}
          tags={selectedBookmarkTags}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  )
}
