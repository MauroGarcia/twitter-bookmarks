import { create } from 'zustand'

export const useAppStore = create((set, get) => ({
  // Estado
  bookmarks: [],
  tags: [],
  selectedTag: null,
  searchQuery: '',
  selectedBookmark: null,
  stats: { bookmarksCount: 0, tagsCount: 0, notesCount: 0 },
  isLoading: false,
  importDialog: false,
  editTagDialog: false,
  editingTag: null,

  // Ações
  setBookmarks: (bookmarks) => set({ bookmarks }),
  setTags: (tags) => set({ tags }),
  setSelectedTag: (tag) => set({ selectedTag: tag }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedBookmark: (bookmark) => set({ selectedBookmark: bookmark }),
  setStats: (stats) => set({ stats }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setImportDialog: (open) => set({ importDialog: open }),
  setEditTagDialog: (open) => set({ editTagDialog: open }),
  setEditingTag: (tag) => set({ editingTag: tag }),

  // Fetch data
  loadBookmarks: async () => {
    const state = get()
    set({ isLoading: true })
    try {
      const bookmarks = await window.api.getBookmarks({
        tag: state.selectedTag,
        search: state.searchQuery
      })
      set({ bookmarks })
    } catch (error) {
      console.error('Erro ao carregar bookmarks:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  // Watch for filter changes
  initializeBookmarks: async () => {
    const state = get()
    await state.loadTags()
    await state.loadStats()
    await state.loadBookmarks()
  },

  loadTags: async () => {
    try {
      const tags = await window.api.getAllTags()
      set({ tags })
    } catch (error) {
      console.error('Erro ao carregar tags:', error)
    }
  },

  loadStats: async () => {
    try {
      const stats = await window.api.getStats()
      set({ stats })
    } catch (error) {
      console.error('Erro ao carregar stats:', error)
    }
  }
}))
