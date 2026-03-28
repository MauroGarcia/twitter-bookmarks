import { ipcMain, dialog } from 'electron'
import * as db from './db.js'
import { importBookmarks } from './twitter-importer.js'

export function registerIpcHandlers() {
  // ============ BOOKMARKS ============
  ipcMain.handle('bookmarks:get', (event, filters) => {
    return db.getBookmarks(filters)
  })

  ipcMain.handle('bookmarks:getById', (event, id) => {
    return db.getBookmarkById(id)
  })

  ipcMain.handle('bookmarks:delete', (event, id) => {
    return db.deleteBookmark(id)
  })

  // ============ TAGS ============
  ipcMain.handle('tags:getAll', (event) => {
    return db.getAllTags()
  })

  ipcMain.handle('tags:create', (event, { name, color }) => {
    return db.createTag(name, color)
  })

  ipcMain.handle('tags:update', (event, { id, name, color }) => {
    return db.updateTag(id, { name, color })
  })

  ipcMain.handle('tags:delete', (event, id) => {
    return db.deleteTag(id)
  })

  // ============ BOOKMARK_TAGS ============
  ipcMain.handle('bookmarkTags:get', (event, bookmarkId) => {
    return db.getBookmarkTags(bookmarkId)
  })

  ipcMain.handle('bookmarkTags:set', (event, { bookmarkId, tagIds }) => {
    return db.setBookmarkTags(bookmarkId, tagIds)
  })

  // ============ NOTES ============
  ipcMain.handle('notes:get', (event, bookmarkId) => {
    return db.getNote(bookmarkId)
  })

  ipcMain.handle('notes:upsert', (event, { bookmarkId, content }) => {
    return db.upsertNote(bookmarkId, content)
  })

  ipcMain.handle('notes:delete', (event, bookmarkId) => {
    return db.deleteNote(bookmarkId)
  })

  // ============ IMPORT ============
  ipcMain.handle('import:run', async (event) => {
    const result = await dialog.showOpenDialog({
      title: 'Selecionar arquivo bookmarks.js',
      defaultPath: require('os').homedir(),
      filters: [
        { name: 'JSON', extensions: ['js'] },
        { name: 'Todos', extensions: ['*'] }
      ]
    })

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, message: 'Cancelado' }
    }

    try {
      const filePath = result.filePaths[0]
      const imported = await importBookmarks(filePath)
      return { success: true, imported, message: `${imported} bookmarks importados com sucesso` }
    } catch (error) {
      return { success: false, message: error.message }
    }
  })

  // ============ STATS ============
  ipcMain.handle('app:getStats', (event) => {
    return db.getStats()
  })
}

export default registerIpcHandlers
