import { create } from 'zustand'
import { api } from '../services/api'
import { mockApi } from '../mock/mockApi'

export const useAppStore = create((set, get) => ({
  // Estado
  bookmarks: [],
  tags: [],
  selectedTag: null,
  searchQuery: '',
  selectedBookmark: null,
  stats: { bookmarksCount: 0, tagsCount: 0, notesCount: 0 },
  isLoading: false,
  isUsingMockData: false,
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
  setIsUsingMockData: (isUsingMockData) => set({ isUsingMockData }),
  setImportDialog: (open) => set({ importDialog: open }),
  setEditTagDialog: (open) => set({ editTagDialog: open }),
  setEditingTag: (tag) => set({ editingTag: tag }),

  // Fetch data
  loadBookmarks: async () => {
    const state = get()
    const filters = {
      tag: state.selectedTag,
      search: state.searchQuery
    }
    set({ isLoading: true })
    try {
      const bookmarks = await api.getBookmarksWithTags(filters)

      if (bookmarks.length === 0 && !state.selectedTag && !state.searchQuery) {
        const mockBookmarks = await mockApi.getBookmarksWithTags(filters)
        const mockStats = await mockApi.getStats()
        set({
          bookmarks: mockBookmarks,
          stats: mockStats,
          isUsingMockData: true
        })
        return
      }

      set({
        bookmarks,
        isUsingMockData: false
      })
    } catch (error) {
      console.error('Erro ao carregar bookmarks:', error)

      if (!state.selectedTag && !state.searchQuery) {
        const mockBookmarks = await mockApi.getBookmarksWithTags(filters)
        const mockStats = await mockApi.getStats()
        set({
          bookmarks: mockBookmarks,
          stats: mockStats,
          isUsingMockData: true
        })
      }
    } finally {
      set({ isLoading: false })
    }
  },

  initializeBookmarks: async () => {
    const state = get()
    await state.loadTags()
    await state.loadStats()
    await state.loadBookmarks()
  },

  loadTags: async () => {
    try {
      const tags = await api.getAllTags()
      set({ tags })
    } catch (error) {
      console.error('Erro ao carregar tags:', error)
    }
  },

  loadStats: async () => {
    try {
      const stats = await api.getStats()
      set({ stats, isUsingMockData: false })
    } catch (error) {
      console.error('Erro ao carregar stats:', error)
      const stats = await mockApi.getStats()
      set({ stats, isUsingMockData: true })
    }
  }
}))
