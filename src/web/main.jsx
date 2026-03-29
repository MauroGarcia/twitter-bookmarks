import React from 'react'
import ReactDOM from 'react-dom/client'
import { setApi } from '../shared/services/api'
import App from '../shared/App'
import { mockApi } from '../shared/mock/mockApi'
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

function withMockFallback(primary, fallback) {
  return async (...args) => {
    try {
      return await primary(...args)
    } catch (error) {
      console.warn('[web] Falling back to local mock API:', error)
      return fallback(...args)
    }
  }
}

function withMockFallbackOnEmpty(primary, fallback, isEmptyResult) {
  return async (...args) => {
    try {
      const result = await primary(...args)

      if (isEmptyResult(result, ...args)) {
        return fallback(...args)
      }

      return result
    } catch (error) {
      console.warn('[web] Falling back to local mock API:', error)
      return fallback(...args)
    }
  }
}

const httpApi = {
  getBookmarks: withMockFallbackOnEmpty(
    (filters) => fetchJson('/api/bookmarks?' + new URLSearchParams(filters)),
    mockApi.getBookmarks,
    (result, filters = {}) => {
      const hasNoFilters = !filters.tag && !filters.search && (!filters.view || filters.view === 'all')

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
    mockApi.getBookmarksWithTags,
    (result, filters = {}) => {
      const hasNoFilters = !filters.tag && !filters.search && (!filters.view || filters.view === 'all')

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
    mockApi.getBookmarkById
  ),
  setBookmarkFavorite: withMockFallback(
    (id, isFavorite) => fetchJson(`/api/bookmarks/${id}/favorite`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isFavorite }) }),
    mockApi.setBookmarkFavorite
  ),
  setBookmarkArchived: withMockFallback(
    (id, isArchived) => fetchJson(`/api/bookmarks/${id}/archived`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isArchived }) }),
    mockApi.setBookmarkArchived
  ),
  deleteBookmark: withMockFallback(
    (id) => fetchJson(`/api/bookmarks/${id}`, { method: 'DELETE' }),
    mockApi.deleteBookmark
  ),

  getAllTags: withMockFallback(
    () => fetchJson('/api/tags'),
    mockApi.getAllTags
  ),
  createTag: withMockFallback(
    (name, color) => fetchJson('/api/tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, color }) }),
    mockApi.createTag
  ),
  updateTag: withMockFallback(
    (id, name, color) => fetchJson(`/api/tags/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, color }) }),
    mockApi.updateTag
  ),
  deleteTag: withMockFallback(
    (id) => fetchJson(`/api/tags/${id}`, { method: 'DELETE' }),
    mockApi.deleteTag
  ),

  getBookmarkTags: withMockFallback(
    (bookmarkId) => fetchJson(`/api/bookmarks/${bookmarkId}/tags`),
    mockApi.getBookmarkTags
  ),
  setBookmarkTags: withMockFallback(
    (bookmarkId, tagIds) => fetchJson(`/api/bookmarks/${bookmarkId}/tags`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tagIds }) }),
    mockApi.setBookmarkTags
  ),

  getNote: withMockFallback(
    (bookmarkId) => fetchJson(`/api/bookmarks/${bookmarkId}/note`),
    mockApi.getNote
  ),
  upsertNote: withMockFallback(
    (bookmarkId, content) => fetchJson(`/api/bookmarks/${bookmarkId}/note`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) }),
    mockApi.upsertNote
  ),
  deleteNote: withMockFallback(
    (bookmarkId) => fetchJson(`/api/bookmarks/${bookmarkId}/note`, { method: 'DELETE' }),
    mockApi.deleteNote
  ),

  importBookmarks: mockApi.importBookmarks,
  getStats: withMockFallbackOnEmpty(
    () => fetchJson('/api/stats'),
    mockApi.getStats,
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
