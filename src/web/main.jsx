import React from 'react'
import ReactDOM from 'react-dom/client'
import { setApi } from '../shared/services/api'
import App from '../shared/App'
import './index.css'

/**
 * Implementação HTTP da API para a versão web.
 * Substitui o bridge IPC do Electron por chamadas fetch a um backend REST.
 */
const httpApi = {
  getBookmarks: (filters) => fetch('/api/bookmarks?' + new URLSearchParams(filters)).then(r => r.json()),
  getBookmarksWithTags: (filters) => fetch('/api/bookmarks/with-tags?' + new URLSearchParams(filters)).then(r => r.json()),
  getBookmarkById: (id) => fetch(`/api/bookmarks/${id}`).then(r => r.json()),
  deleteBookmark: (id) => fetch(`/api/bookmarks/${id}`, { method: 'DELETE' }).then(r => r.json()),

  getAllTags: () => fetch('/api/tags').then(r => r.json()),
  createTag: (name, color) => fetch('/api/tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, color }) }).then(r => r.json()),
  updateTag: (id, name, color) => fetch(`/api/tags/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, color }) }).then(r => r.json()),
  deleteTag: (id) => fetch(`/api/tags/${id}`, { method: 'DELETE' }).then(r => r.json()),

  getBookmarkTags: (bookmarkId) => fetch(`/api/bookmarks/${bookmarkId}/tags`).then(r => r.json()),
  setBookmarkTags: (bookmarkId, tagIds) => fetch(`/api/bookmarks/${bookmarkId}/tags`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tagIds }) }).then(r => r.json()),

  getNote: (bookmarkId) => fetch(`/api/bookmarks/${bookmarkId}/note`).then(r => r.json()),
  upsertNote: (bookmarkId, content) => fetch(`/api/bookmarks/${bookmarkId}/note`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) }).then(r => r.json()),
  deleteNote: (bookmarkId) => fetch(`/api/bookmarks/${bookmarkId}/note`, { method: 'DELETE' }).then(r => r.json()),

  importBookmarks: () => Promise.reject(new Error('Importação via arquivo não disponível na versão web')),
  getStats: () => fetch('/api/stats').then(r => r.json()),
}

// Injeta a implementação HTTP
setApi(httpApi)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
