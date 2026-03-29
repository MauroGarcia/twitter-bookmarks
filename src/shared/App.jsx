import { useEffect } from 'react'
import { useAppStore } from './store/appStore'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
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
    <div className="flex h-screen bg-surface text-on-surface">
      <Sidebar onImport={() => setImportDialog(true)} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onImport={() => setImportDialog(true)} />

        <div className="flex-1 overflow-y-auto p-8">
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
