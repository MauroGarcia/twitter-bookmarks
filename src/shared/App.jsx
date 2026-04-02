import { useEffect, useRef } from 'react'
import { useAppStore } from './store/appStore'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { BookmarkList } from './components/BookmarkList'
import { ImportDialog } from './components/ImportDialog'
import { TagsView } from './components/TagsView'
import { TweetDetail } from './components/TweetDetail'

const BOOKMARK_VIEWS = new Set(['all', 'favorites', 'archived'])

export default function App() {
  const selectedBookmark = useAppStore((state) => state.selectedBookmark)
  const setSelectedBookmark = useAppStore((state) => state.setSelectedBookmark)
  const setImportDialog = useAppStore((state) => state.setImportDialog)
  const activeView = useAppStore((state) => state.activeView)
  const selectedTag = useAppStore((state) => state.selectedTag)
  const searchQuery = useAppStore((state) => state.searchQuery)
  const searchTagNames = useAppStore((state) => state.searchTagNames)
  const searchAuthorHandles = useAppStore((state) => state.searchAuthorHandles)
  const loadBookmarks = useAppStore((state) => state.loadBookmarks)
  const hasHandledInitialFilters = useRef(false)

  useEffect(() => {
    // Inicializar dados
    useAppStore.getState().initializeBookmarks()
  }, [])

  // Recarregar quando filtros mudam
  useEffect(() => {
    if (!BOOKMARK_VIEWS.has(activeView)) {
      return
    }

    if (!hasHandledInitialFilters.current) {
      hasHandledInitialFilters.current = true
      return
    }

    loadBookmarks()
  }, [activeView, selectedTag, searchQuery, searchTagNames, searchAuthorHandles, loadBookmarks])

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
          {BOOKMARK_VIEWS.has(activeView)
            ? <BookmarkList onSelectBookmark={handleSelectBookmark} />
            : <TagsView />}
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
