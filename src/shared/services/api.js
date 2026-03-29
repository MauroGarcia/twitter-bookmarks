/**
 * Camada de serviço abstrata — isola os componentes e store de onde os dados vêm.
 *
 * Uso:
 *   - Electron (renderer/main.jsx): setApi(window.api)
 *   - Web (web/main.jsx):           setApi(httpApi)
 */

let _api = null

export function setApi(impl) {
  _api = impl
}

export function getApi() {
  if (!_api) throw new Error('[api] Nenhuma implementação de API foi registrada. Chame setApi() antes de usar.')
  return _api
}

// Atalhos para uso direto no store/hooks
export const api = {
  getBookmarks: (...args) => getApi().getBookmarks(...args),
  getBookmarksWithTags: (...args) => getApi().getBookmarksWithTags(...args),
  getBookmarkById: (...args) => getApi().getBookmarkById(...args),
  setBookmarkFavorite: (...args) => getApi().setBookmarkFavorite(...args),
  setBookmarkArchived: (...args) => getApi().setBookmarkArchived(...args),
  deleteBookmark: (...args) => getApi().deleteBookmark(...args),

  getAllTags: (...args) => getApi().getAllTags(...args),
  getAllAuthors: (...args) => getApi().getAllAuthors(...args),
  createTag: (...args) => getApi().createTag(...args),
  updateTag: (...args) => getApi().updateTag(...args),
  deleteTag: (...args) => getApi().deleteTag(...args),

  getBookmarkTags: (...args) => getApi().getBookmarkTags(...args),
  setBookmarkTags: (...args) => getApi().setBookmarkTags(...args),

  getNote: (...args) => getApi().getNote(...args),
  upsertNote: (...args) => getApi().upsertNote(...args),
  deleteNote: (...args) => getApi().deleteNote(...args),

  importBookmarks: (...args) => getApi().importBookmarks(...args),
  getStats: (...args) => getApi().getStats(...args),
}
