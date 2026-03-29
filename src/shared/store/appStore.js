import { create } from 'zustand'
import { api } from '../services/api'
import { normalizeBookmarks } from '../lib/bookmark-utils'

const BOOKMARK_BATCH_SIZE = 12
let mockApiPromise = null

async function getMockApi() {
  if (!mockApiPromise) {
    mockApiPromise = import('../mock/mockApi').then((module) => module.mockApi)
  }

  return mockApiPromise
}

function buildBookmarksCacheKey(filters = {}) {
  return JSON.stringify({
    view: filters.view || 'all',
    tag: filters.tag || '',
    tags: Array.isArray(filters.tags) ? [...filters.tags].sort() : [],
    authors: Array.isArray(filters.authors) ? [...filters.authors].sort() : [],
    search: filters.search || ''
  })
}

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
  activeView: 'all',
  selectedTag: null,
  searchQuery: '',
  searchTagNames: [],
  searchAuthorHandles: [],
  tagSearchQuery: '',
  selectedBookmark: null,
  stats: { bookmarksCount: 0, tagsCount: 0, notesCount: 0, favoritesCount: 0, archivedCount: 0 },
  isLoading: false,
  isLoadingMore: false,
  hasMoreBookmarks: false,
  transitioningBookmarkIds: [],
  bookmarksCache: {},
  bookmarkMutationVersion: {},
  isUsingMockData: false,
  bookmarksRequestId: 0,
  importDialog: false,
  editTagDialog: false,
  editingTag: null,

  // Ações
  setBookmarks: (bookmarks) => set({ bookmarks }),
  setTags: (tags) => set({ tags }),
  setActiveView: (activeView) => set({ activeView }),
  setSelectedTag: (tag) => set({ selectedTag: tag }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchTagNames: (tags) => set({ searchTagNames: tags }),
  setSearchAuthorHandles: (authors) => set({ searchAuthorHandles: authors }),
  setTagSearchQuery: (query) => set({ tagSearchQuery: query }),
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
      tags: state.searchTagNames,
      authors: state.searchAuthorHandles,
      search: state.searchQuery,
      view: state.activeView,
      offset,
      limit
    }
    const cacheKey = buildBookmarksCacheKey(filters)
    const cachedCollection = state.bookmarksCache[cacheKey]

    if (cachedCollection) {
      set({
        bookmarks: cachedCollection.bookmarks,
        hasMoreBookmarks: cachedCollection.hasMore,
        isLoading: false,
        isLoadingMore: false
      })
      return
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
        const mockApi = await getMockApi()
        const mockBookmarks = await mockApi.getBookmarksWithTags(filters)
        const mockStats = await mockApi.getStats()
        const page = normalizePageResult(mockBookmarks, offset, limit)

        if (get().bookmarksRequestId !== requestId) {
          return
        }

        set({
          bookmarks: normalizeBookmarks(page.items),
          hasMoreBookmarks: page.hasMore,
          bookmarksCache: {
            ...get().bookmarksCache,
            [cacheKey]: {
              bookmarks: normalizeBookmarks(page.items),
              hasMore: page.hasMore
            }
          },
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

      if (page.total === 0 && !state.selectedTag && !state.searchQuery && state.searchTagNames.length === 0 && state.searchAuthorHandles.length === 0) {
        const mockApi = await getMockApi()
        const mockBookmarks = await mockApi.getBookmarksWithTags(filters)
        const mockStats = await mockApi.getStats()
        const mockPage = normalizePageResult(mockBookmarks, offset, limit)

        if (get().bookmarksRequestId !== requestId) {
          return
        }

        set({
          bookmarks: normalizeBookmarks(mockPage.items),
          hasMoreBookmarks: mockPage.hasMore,
          bookmarksCache: {
            ...get().bookmarksCache,
            [cacheKey]: {
              bookmarks: normalizeBookmarks(mockPage.items),
              hasMore: mockPage.hasMore
            }
          },
          stats: mockStats,
          isUsingMockData: true
        })
        return
      }

      set({
        bookmarks: normalizeBookmarks(page.items),
        hasMoreBookmarks: page.hasMore,
        bookmarksCache: {
          ...get().bookmarksCache,
          [cacheKey]: {
            bookmarks: normalizeBookmarks(page.items),
            hasMore: page.hasMore
          }
        },
        isUsingMockData: false
      })
    } catch (error) {
      console.error('Erro ao carregar bookmarks:', error)

      if ((!state.selectedTag && !state.searchQuery && state.searchTagNames.length === 0 && state.searchAuthorHandles.length === 0) || shouldPreferMockData) {
        const mockApi = await getMockApi()
        const mockBookmarks = await mockApi.getBookmarksWithTags(filters)
        const mockStats = await mockApi.getStats()
        const page = normalizePageResult(mockBookmarks, offset, limit)

        if (get().bookmarksRequestId !== requestId) {
          return
        }

        set({
          bookmarks: normalizeBookmarks(page.items),
          hasMoreBookmarks: page.hasMore,
          bookmarksCache: {
            ...get().bookmarksCache,
            [cacheKey]: {
              bookmarks: normalizeBookmarks(page.items),
              hasMore: page.hasMore
            }
          },
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
      tags: state.searchTagNames,
      authors: state.searchAuthorHandles,
      search: state.searchQuery,
      view: state.activeView,
      offset,
      limit
    }
    const cacheKey = buildBookmarksCacheKey(filters)
    const requestId = state.bookmarksRequestId + 1
    const shouldPreferMockData = state.isUsingMockData

    set({
      isLoadingMore: true,
      bookmarksRequestId: requestId
    })

    try {
      const sourceResult = shouldPreferMockData
        ? await (await getMockApi()).getBookmarksWithTags(filters)
        : await api.getBookmarksWithTags(filters)
      const page = normalizePageResult(sourceResult, offset, limit)

      if (get().bookmarksRequestId !== requestId) {
        return
      }

      set((currentState) => ({
        bookmarks: normalizeBookmarks([...currentState.bookmarks, ...page.items]),
        bookmarksCache: {
          ...currentState.bookmarksCache,
          [cacheKey]: {
            bookmarks: normalizeBookmarks([...currentState.bookmarks, ...page.items]),
            hasMore: page.hasMore
          }
        },
        hasMoreBookmarks: page.hasMore,
        isUsingMockData: shouldPreferMockData
      }))
    } catch (error) {
      console.error('Erro ao carregar mais bookmarks:', error)

      if (shouldPreferMockData) {
        const mockApi = await getMockApi()
        const mockBookmarks = await mockApi.getBookmarksWithTags(filters)
        const page = normalizePageResult(mockBookmarks, offset, limit)

        if (get().bookmarksRequestId !== requestId) {
          return
        }

        set((currentState) => ({
          bookmarks: normalizeBookmarks([...currentState.bookmarks, ...page.items]),
          bookmarksCache: {
            ...currentState.bookmarksCache,
            [cacheKey]: {
              bookmarks: normalizeBookmarks([...currentState.bookmarks, ...page.items]),
              hasMore: page.hasMore
            }
          },
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
      const stats = await (await getMockApi()).getStats()
      set({ stats, isUsingMockData: true })
    }
  },

  toggleBookmarkFavorite: async (bookmarkId) => {
    const state = get()
    const bookmark = state.bookmarks.find((item) => item.id === bookmarkId) || state.selectedBookmark

    if (!bookmark) {
      return
    }

    const nextValue = !bookmark.is_favorite
    const mutationApi = state.isUsingMockData ? await getMockApi() : api
    const mutationVersion = Date.now()

    set((currentState) => {
      const shouldRemove = currentState.activeView === 'favorites' && !nextValue
      const nextBookmarks = shouldRemove
        ? currentState.bookmarks.filter((item) => item.id !== bookmarkId)
        : currentState.bookmarks.map((item) =>
            item.id === bookmarkId
              ? { ...item, is_favorite: nextValue }
              : item
          )

      return {
        bookmarks: nextBookmarks,
        bookmarksCache: {},
        bookmarkMutationVersion: {
          ...currentState.bookmarkMutationVersion,
          [bookmarkId]: mutationVersion
        },
        selectedBookmark: currentState.selectedBookmark?.id === bookmarkId
          ? { ...currentState.selectedBookmark, is_favorite: nextValue }
          : currentState.selectedBookmark,
        stats: {
          ...currentState.stats,
          favoritesCount: bookmark.is_archived
            ? currentState.stats.favoritesCount || 0
            : Math.max(
                0,
                (currentState.stats.favoritesCount || 0) + (nextValue ? 1 : -1)
              )
        }
      }
    })

    try {
      await mutationApi.setBookmarkFavorite(bookmarkId, nextValue)
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error)
      set({ bookmarksCache: {} })
      await get().loadStats()
      await get().loadBookmarks()
    }
  },

  toggleBookmarkArchived: async (bookmarkId) => {
    const state = get()
    const bookmark = state.bookmarks.find((item) => item.id === bookmarkId) || state.selectedBookmark

    if (!bookmark) {
      return
    }

    const nextValue = !bookmark.is_archived
    const shouldFadeOut = nextValue && state.activeView !== 'archived'
    const mutationApi = state.isUsingMockData ? await getMockApi() : api
    const mutationVersion = Date.now()

    if (shouldFadeOut) {
      set((currentState) => ({
        transitioningBookmarkIds: [...new Set([...currentState.transitioningBookmarkIds, bookmarkId])]
      }))
      await new Promise((resolve) => setTimeout(resolve, 140))
    }

    set((currentState) => {
      const shouldRemove = nextValue
        ? currentState.activeView !== 'archived'
        : currentState.activeView === 'archived'

      const nextBookmarks = shouldRemove
        ? currentState.bookmarks.filter((item) => item.id !== bookmarkId)
        : currentState.bookmarks.map((item) =>
            item.id === bookmarkId
              ? { ...item, is_archived: nextValue }
              : item
          )

      return {
        bookmarks: nextBookmarks,
        bookmarksCache: {},
        bookmarkMutationVersion: {
          ...currentState.bookmarkMutationVersion,
          [bookmarkId]: mutationVersion
        },
        selectedBookmark: currentState.selectedBookmark?.id === bookmarkId
          ? { ...currentState.selectedBookmark, is_archived: nextValue }
          : currentState.selectedBookmark,
        transitioningBookmarkIds: currentState.transitioningBookmarkIds.filter((id) => id !== bookmarkId),
        stats: {
          ...currentState.stats,
          favoritesCount: bookmark.is_favorite
            ? Math.max(0, (currentState.stats.favoritesCount || 0) + (nextValue ? -1 : 1))
            : currentState.stats.favoritesCount || 0,
          archivedCount: Math.max(
            0,
            (currentState.stats.archivedCount || 0) + (nextValue ? 1 : -1)
          )
        }
      }
    })

    try {
      await mutationApi.setBookmarkArchived(bookmarkId, nextValue)
    } catch (error) {
      console.error('Erro ao atualizar arquivamento:', error)
      set((currentState) => ({
        transitioningBookmarkIds: currentState.transitioningBookmarkIds.filter((id) => id !== bookmarkId),
        bookmarksCache: {}
      }))
      await get().loadStats()
      await get().loadBookmarks()
    }
  }
}))
