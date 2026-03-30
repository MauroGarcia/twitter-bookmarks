import React from 'react'
import ReactDOM from 'react-dom/client'
import { setApi } from '../shared/services/api'
import App from '../shared/App'
import './index.css'

/**
 * Implementação HTTP da API para a versão web.
 * Substitui o bridge IPC do Electron por chamadas fetch a um backend REST.
 */
async function fetchJson(url, options) {
  const response = await fetch(url, options)

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return response.json()
}

let mockApiPromise = null

function getMockApi() {
  if (!mockApiPromise) {
    mockApiPromise = import('../shared/mock/mockApi').then((module) => module.mockApi)
  }

  return mockApiPromise
}

function withMockFallback(primary, fallback) {
  return async (...args) => {
    try {
      return await primary(...args)
    } catch (error) {
      console.warn('[web] Falling back to local mock API:', error)
      const mockApi = await getMockApi()
      return fallback(mockApi, ...args)
    }
  }
}

function withMockFallbackOnEmpty(primary, fallback, isEmptyResult) {
  return async (...args) => {
    try {
      const result = await primary(...args)

      if (isEmptyResult(result, ...args)) {
        const mockApi = await getMockApi()
        return fallback(mockApi, ...args)
      }

      return result
    } catch (error) {
      console.warn('[web] Falling back to local mock API:', error)
      const mockApi = await getMockApi()
      return fallback(mockApi, ...args)
    }
  }
}

const httpApi = {
  getBookmarks: withMockFallbackOnEmpty(
    (filters) => fetchJson('/api/bookmarks?' + new URLSearchParams(filters)),
    (mockApi, filters) => mockApi.getBookmarks(filters),
    (result, filters = {}) => {
      const hasNoFilters = !filters.tag && !filters.search && (!filters.tags || filters.tags.length === 0) && (!filters.authors || filters.authors.length === 0) && (!filters.view || filters.view === 'all')

      if (!hasNoFilters) {
        return false
      }

      return Array.isArray(result)
        ? result.length === 0
        : Array.isArray(result?.items) && Number(result?.total || 0) === 0
    }
  ),
  getBookmarksWithTags: withMockFallbackOnEmpty(
    (filters) => fetchJson('/api/bookmarks/with-tags?' + new URLSearchParams(filters)),
    (mockApi, filters) => mockApi.getBookmarksWithTags(filters),
    (result, filters = {}) => {
      const hasNoFilters = !filters.tag && !filters.search && (!filters.tags || filters.tags.length === 0) && (!filters.authors || filters.authors.length === 0) && (!filters.view || filters.view === 'all')

      if (!hasNoFilters) {
        return false
      }

      return Array.isArray(result)
        ? result.length === 0
        : Array.isArray(result?.items) && Number(result?.total || 0) === 0
    }
  ),
  getBookmarkById: withMockFallback(
    (id) => fetchJson(`/api/bookmarks/${id}`),
    (mockApi, id) => mockApi.getBookmarkById(id)
  ),
  setBookmarkFavorite: withMockFallback(
    (id, isFavorite) => fetchJson(`/api/bookmarks/${id}/favorite`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isFavorite }) }),
    (mockApi, id, isFavorite) => mockApi.setBookmarkFavorite(id, isFavorite)
  ),
  setBookmarkArchived: withMockFallback(
    (id, isArchived) => fetchJson(`/api/bookmarks/${id}/archived`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isArchived }) }),
    (mockApi, id, isArchived) => mockApi.setBookmarkArchived(id, isArchived)
  ),
  deleteBookmark: withMockFallback(
    (id) => fetchJson(`/api/bookmarks/${id}`, { method: 'DELETE' }),
    (mockApi, id) => mockApi.deleteBookmark(id)
  ),

  getAllTags: withMockFallback(
    () => fetchJson('/api/tags'),
    (mockApi) => mockApi.getAllTags()
  ),
  getAllAuthors: withMockFallback(
    () => fetchJson('/api/authors'),
    (mockApi) => mockApi.getAllAuthors()
  ),
  createTag: withMockFallback(
    (name, color) => fetchJson('/api/tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, color }) }),
    (mockApi, name, color) => mockApi.createTag(name, color)
  ),
  updateTag: withMockFallback(
    (id, name, color) => fetchJson(`/api/tags/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, color }) }),
    (mockApi, id, name, color) => mockApi.updateTag(id, name, color)
  ),
  deleteTag: withMockFallback(
    (id) => fetchJson(`/api/tags/${id}`, { method: 'DELETE' }),
    (mockApi, id) => mockApi.deleteTag(id)
  ),

  getBookmarkTags: withMockFallback(
    (bookmarkId) => fetchJson(`/api/bookmarks/${bookmarkId}/tags`),
    (mockApi, bookmarkId) => mockApi.getBookmarkTags(bookmarkId)
  ),
  setBookmarkTags: withMockFallback(
    (bookmarkId, tagIds) => fetchJson(`/api/bookmarks/${bookmarkId}/tags`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tagIds }) }),
    (mockApi, bookmarkId, tagIds) => mockApi.setBookmarkTags(bookmarkId, tagIds)
  ),

  getNote: withMockFallback(
    (bookmarkId) => fetchJson(`/api/bookmarks/${bookmarkId}/note`),
    (mockApi, bookmarkId) => mockApi.getNote(bookmarkId)
  ),
  upsertNote: withMockFallback(
    (bookmarkId, content) => fetchJson(`/api/bookmarks/${bookmarkId}/note`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) }),
    (mockApi, bookmarkId, content) => mockApi.upsertNote(bookmarkId, content)
  ),
  deleteNote: withMockFallback(
    (bookmarkId) => fetchJson(`/api/bookmarks/${bookmarkId}/note`, { method: 'DELETE' }),
    (mockApi, bookmarkId) => mockApi.deleteNote(bookmarkId)
  ),

  importBookmarks: async (payload) => (await getMockApi()).importBookmarks(payload),
  getXAuthStatus: async () => ({
    hasConfig: false,
    connected: false,
    config: {
      clientId: '',
      hasClientSecret: false,
      redirectUri: '',
      scopes: []
    },
    profile: null,
    lastSyncedAt: null
  }),
  saveXAuthConfig: async () => {
    throw new Error('A conexão com X está disponível apenas no app desktop')
  },
  connectXAccount: async () => {
    throw new Error('A conexão com X está disponível apenas no app desktop')
  },
  disconnectXAccount: async () => {
    throw new Error('A conexão com X está disponível apenas no app desktop')
  },
  syncXBookmarks: async () => {
    throw new Error('A sincronização com X está disponível apenas no app desktop')
  },
  getStats: withMockFallbackOnEmpty(
    () => fetchJson('/api/stats'),
    (mockApi) => mockApi.getStats(),
    (result) => Number(result?.bookmarksCount || 0) === 0
  ),
}

// Injeta a implementação HTTP
setApi(httpApi)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
