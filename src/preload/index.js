import { contextBridge, ipcRenderer } from 'electron'

const api = {
  // Bookmarks
  getBookmarks: (filters) => ipcRenderer.invoke('bookmarks:get', filters),
  getBookmarksWithTags: (filters) => ipcRenderer.invoke('bookmarks:getWithTags', filters),
  getBookmarkById: (id) => ipcRenderer.invoke('bookmarks:getById', id),
  deleteBookmark: (id) => ipcRenderer.invoke('bookmarks:delete', id),

  // Tags
  getAllTags: () => ipcRenderer.invoke('tags:getAll'),
  createTag: (name, color) => ipcRenderer.invoke('tags:create', { name, color }),
  updateTag: (id, name, color) => ipcRenderer.invoke('tags:update', { id, name, color }),
  deleteTag: (id) => ipcRenderer.invoke('tags:delete', id),

  // Bookmark Tags
  getBookmarkTags: (bookmarkId) => ipcRenderer.invoke('bookmarkTags:get', bookmarkId),
  setBookmarkTags: (bookmarkId, tagIds) => ipcRenderer.invoke('bookmarkTags:set', { bookmarkId, tagIds }),

  // Notes
  getNote: (bookmarkId) => ipcRenderer.invoke('notes:get', bookmarkId),
  upsertNote: (bookmarkId, content) => ipcRenderer.invoke('notes:upsert', { bookmarkId, content }),
  deleteNote: (bookmarkId) => ipcRenderer.invoke('notes:delete', bookmarkId),

  // Import
  importBookmarks: () => ipcRenderer.invoke('import:run'),

  // Stats
  getStats: () => ipcRenderer.invoke('app:getStats')
}

contextBridge.exposeInMainWorld('api', api)
