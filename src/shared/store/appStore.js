import { create } from 'zustand'
import { api } from '../services/api'
import { mockApi } from '../mock/mockApi'
import { normalizeBookmarks } from '../lib/bookmark-utils'

const BOOKMARK_BATCH_SIZE = 12

function normalizePageResult(result, offset, limit) {
  if (Array.isArray(result)) {
    const items = result.slice(offset, offset + limit)
    const total = result.length

    return {
      items,
      total,
      hasMore: offset + items.length < total
    }
  }

  const rawItems = Array.isArray(result?.items)
    ? result.items
    : Array.isArray(result?.bookmarks)
      ? result.bookmarks
      : []
  const total = Number.isFinite(Number(result?.total)) ? Number(result.total) : offset + rawItems.length
  const hasMore = typeof result?.hasMore === 'boolean'
    ? result.hasMore
    : offset + rawItems.length < total

  return {
    items: rawItems,
    total,
    hasMore
  }
}

export const useAppStore = create((set, get) => ({
  // Estado
  bookmarks: [],
  tags: [],
  selectedTag: null,
  searchQuery: '',
  selectedBookmark: null,
  stats: { bookmarksCount: 0, tagsCount: 0, notesCount: 0 },
  isLoading: false,
  isLoadingMore: false,
  hasMoreBookmarks: false,
  isUsingMockData: false,
  bookmarksRequestId: 0,
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
  setIsLoadingMore: (loading) => set({ isLoadingMore: loading }),
  setIsUsingMockData: (isUsingMockData) => set({ isUsingMockData }),
  setImportDialog: (open) => set({ importDialog: open }),
  setEditTagDialog: (open) => set({ editTagDialog: open }),
  setEditingTag: (tag) => set({ editingTag: tag }),

  // Fetch data
  loadBookmarks: async () => {
    const state = get()
    const offset = 0
    const limit = BOOKMARK_BATCH_SIZE
    const filters = {
      tag: state.selectedTag,
      search: state.searchQuery,
      offset,
      limit
    }
    const requestId = state.bookmarksRequestId + 1
    const shouldPreferMockData = state.isUsingMockData

    set({
      isLoading: true,
      isLoadingMore: false,
      hasMoreBookmarks: false,
      bookmarksRequestId: requestId
    })

    try {
      if (shouldPreferMockData) {
        const mockBookmarks = await mockApi.getBookmarksWithTags(filters)
        const mockStats = await mockApi.getStats()
        const page = normalizePageResult(mockBookmarks, offset, limit)

        if (get().bookmarksRequestId !== requestId) {
          return
        }

        set({
          bookmarks: normalizeBookmarks(page.items),
          hasMoreBookmarks: page.hasMore,
          stats: mockStats,
          isUsingMockData: true
        })
        return
      }

      const bookmarks = await api.getBookmarksWithTags(filters)
      const page = normalizePageResult(bookmarks, offset, limit)

      if (get().bookmarksRequestId !== requestId) {
        return
      }

      if (page.total === 0 && !state.selectedTag && !state.searchQuery) {
        const mockBookmarks = await mockApi.getBookmarksWithTags(filters)
        const mockStats = await mockApi.getStats()
        const mockPage = normalizePageResult(mockBookmarks, offset, limit)

        if (get().bookmarksRequestId !== requestId) {
          return
        }

        set({
          bookmarks: normalizeBookmarks(mockPage.items),
          hasMoreBookmarks: mockPage.hasMore,
          stats: mockStats,
          isUsingMockData: true
        })
        return
      }

      set({
        bookmarks: normalizeBookmarks(page.items),
        hasMoreBookmarks: page.hasMore,
        isUsingMockData: false
      })
    } catch (error) {
      console.error('Erro ao carregar bookmarks:', error)

      if (!state.selectedTag && !state.searchQuery || shouldPreferMockData) {
        const mockBookmarks = await mockApi.getBookmarksWithTags(filters)
        const mockStats = await mockApi.getStats()
        const page = normalizePageResult(mockBookmarks, offset, limit)

        if (get().bookmarksRequestId !== requestId) {
          return
        }

        set({
          bookmarks: normalizeBookmarks(page.items),
          hasMoreBookmarks: page.hasMore,
          stats: mockStats,
          isUsingMockData: true
        })
      }
    } finally {
      if (get().bookmarksRequestId === requestId) {
        set({ isLoading: false })
      }
    }
  },

  loadMoreBookmarks: async () => {
    const state = get()
    if (state.isLoading || state.isLoadingMore || !state.hasMoreBookmarks) {
      return
    }

    const offset = state.bookmarks.length
    const limit = BOOKMARK_BATCH_SIZE
    const filters = {
      tag: state.selectedTag,
      search: state.searchQuery,
      offset,
      limit
    }
    const requestId = state.bookmarksRequestId + 1
    const shouldPreferMockData = state.isUsingMockData

    set({
      isLoadingMore: true,
      bookmarksRequestId: requestId
    })

    try {
      const sourceResult = shouldPreferMockData
        ? await mockApi.getBookmarksWithTags(filters)
        : await api.getBookmarksWithTags(filters)
      const page = normalizePageResult(sourceResult, offset, limit)

      if (get().bookmarksRequestId !== requestId) {
        return
      }

      set((currentState) => ({
        bookmarks: normalizeBookmarks([...currentState.bookmarks, ...page.items]),
        hasMoreBookmarks: page.hasMore,
        isUsingMockData: shouldPreferMockData
      }))
    } catch (error) {
      console.error('Erro ao carregar mais bookmarks:', error)

      if (shouldPreferMockData) {
        const mockBookmarks = await mockApi.getBookmarksWithTags(filters)
        const page = normalizePageResult(mockBookmarks, offset, limit)

        if (get().bookmarksRequestId !== requestId) {
          return
        }

        set((currentState) => ({
          bookmarks: normalizeBookmarks([...currentState.bookmarks, ...page.items]),
          hasMoreBookmarks: page.hasMore,
          isUsingMockData: true
        }))
      }
    } finally {
      if (get().bookmarksRequestId === requestId) {
        set({ isLoadingMore: false })
      }
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
