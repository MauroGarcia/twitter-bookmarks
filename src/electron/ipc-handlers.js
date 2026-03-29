import { ipcMain, dialog } from 'electron'
import * as db from './db.js'
import { importBookmarks } from './twitter-importer.js'

// Helper para error handling em handlers
function createErrorHandler(handlerName, handler) {
  return async (event, ...args) => {
    try {
      return await handler(event, ...args)
    } catch (error) {
      console.error(`[IPC Handler Error] ${handlerName}:`, error)
      throw new Error(`Erro em ${handlerName}: ${error.message}`)
    }
  }
}

export function registerIpcHandlers() {
  // ============ BOOKMARKS ============
  ipcMain.handle('bookmarks:get', createErrorHandler('bookmarks:get', (event, filters) => {
    return db.getBookmarks(filters)
  }))

  ipcMain.handle('bookmarks:getWithTags', createErrorHandler('bookmarks:getWithTags', (event, filters) => {
    return db.getBookmarksWithTags(filters)
  }))

  ipcMain.handle('bookmarks:getById', createErrorHandler('bookmarks:getById', (event, id) => {
    if (!id) throw new Error('ID do bookmark não fornecido')
    return db.getBookmarkById(id)
  }))

  ipcMain.handle('bookmarks:setFavorite', createErrorHandler('bookmarks:setFavorite', (event, { id, isFavorite }) => {
    if (!id) throw new Error('ID do bookmark não fornecido')
    return db.setBookmarkFavorite(id, Boolean(isFavorite))
  }))

  ipcMain.handle('bookmarks:setArchived', createErrorHandler('bookmarks:setArchived', (event, { id, isArchived }) => {
    if (!id) throw new Error('ID do bookmark não fornecido')
    return db.setBookmarkArchived(id, Boolean(isArchived))
  }))

  ipcMain.handle('bookmarks:delete', createErrorHandler('bookmarks:delete', (event, id) => {
    if (!id) throw new Error('ID do bookmark não fornecido')
    return db.deleteBookmark(id)
  }))

  // ============ TAGS ============
  ipcMain.handle('tags:getAll', createErrorHandler('tags:getAll', (event) => {
    return db.getAllTags()
  }))

  ipcMain.handle('tags:create', createErrorHandler('tags:create', (event, { name, color }) => {
    if (!name || !name.trim()) throw new Error('Nome da tag é obrigatório')
    return db.createTag(name, color)
  }))

  ipcMain.handle('tags:update', createErrorHandler('tags:update', (event, { id, name, color }) => {
    if (!id) throw new Error('ID da tag não fornecido')
    if (!name || !name.trim()) throw new Error('Nome da tag é obrigatório')
    return db.updateTag(id, { name, color })
  }))

  ipcMain.handle('tags:delete', createErrorHandler('tags:delete', (event, id) => {
    if (!id) throw new Error('ID da tag não fornecido')
    return db.deleteTag(id)
  }))

  // ============ BOOKMARK_TAGS ============
  ipcMain.handle('bookmarkTags:get', createErrorHandler('bookmarkTags:get', (event, bookmarkId) => {
    if (!bookmarkId) throw new Error('ID do bookmark não fornecido')
    return db.getBookmarkTags(bookmarkId)
  }))

  ipcMain.handle('bookmarkTags:set', createErrorHandler('bookmarkTags:set', (event, { bookmarkId, tagIds }) => {
    if (!bookmarkId) throw new Error('ID do bookmark não fornecido')
    if (!Array.isArray(tagIds)) throw new Error('IDs das tags devem ser um array')
    return db.setBookmarkTags(bookmarkId, tagIds)
  }))

  // ============ NOTES ============
  ipcMain.handle('notes:get', createErrorHandler('notes:get', (event, bookmarkId) => {
    if (!bookmarkId) throw new Error('ID do bookmark não fornecido')
    return db.getNote(bookmarkId)
  }))

  ipcMain.handle('notes:upsert', createErrorHandler('notes:upsert', (event, { bookmarkId, content }) => {
    if (!bookmarkId) throw new Error('ID do bookmark não fornecido')
    if (typeof content !== 'string') throw new Error('Conteúdo da nota deve ser uma string')
    return db.upsertNote(bookmarkId, content)
  }))

  ipcMain.handle('notes:delete', createErrorHandler('notes:delete', (event, bookmarkId) => {
    if (!bookmarkId) throw new Error('ID do bookmark não fornecido')
    return db.deleteNote(bookmarkId)
  }))

  // ============ IMPORT ============
  ipcMain.handle('import:run', createErrorHandler('import:run', async (event) => {
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
      console.error('[Import Error]:', error)
      return { success: false, message: `Erro na importação: ${error.message}` }
    }
  }))

  // ============ STATS ============
  ipcMain.handle('app:getStats', createErrorHandler('app:getStats', (event) => {
    return db.getStats()
  }))
}

export default registerIpcHandlers
