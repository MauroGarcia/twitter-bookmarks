import { useEffect } from 'react'
import { useAppStore } from './store/appStore'
import { Sidebar } from './components/Sidebar'
import { SearchBar } from './components/SearchBar'
import { BookmarkList } from './components/BookmarkList'
import { ImportDialog } from './components/ImportDialog'
import { TweetDetail } from './components/TweetDetail'

export default function App() {
  const {
    selectedBookmark,
    setSelectedBookmark,
    setImportDialog,
    selectedTag,
    searchQuery,
    loadBookmarks
  } = useAppStore()

  useEffect(() => {
    // Inicializar dados
    useAppStore.getState().initializeBookmarks()
  }, [])

  // Recarregar quando filtros mudam
  useEffect(() => {
    loadBookmarks()
  }, [selectedTag, searchQuery])

  const handleSelectBookmark = (bookmark) => {
    setSelectedBookmark(bookmark)
  }

  const handleCloseDetail = () => {
    setSelectedBookmark(null)
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white">
      <Sidebar onImport={() => setImportDialog(true)} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="p-4">
            <div className="mb-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-twitter-600 to-twitter-500 bg-clip-text text-transparent">
                📚 Twitter Bookmarks
              </h1>
              <p className="text-sm text-gray-500 mt-1">Organize e pesquise seus bookmarks salvos</p>
            </div>
            <SearchBar />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <BookmarkList onSelectBookmark={handleSelectBookmark} />
        </div>
      </main>

      <ImportDialog />
      {selectedBookmark && (
        <TweetDetail
          bookmark={selectedBookmark}
          tags={selectedBookmark.tags || []}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  )
}
