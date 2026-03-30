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

function resolveApi() {
  if (_api) {
    return _api
  }

  if (typeof window !== 'undefined' && window.api) {
    _api = window.api
    return _api
  }

  throw new Error('[api] Nenhuma implementação de API foi registrada. Chame setApi() antes de usar.')
}

export function getApi() {
  return resolveApi()
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
  getXAuthStatus: (...args) => getApi().getXAuthStatus(...args),
  saveXAuthConfig: (...args) => getApi().saveXAuthConfig(...args),
  connectXAccount: (...args) => getApi().connectXAccount(...args),
  disconnectXAccount: (...args) => getApi().disconnectXAccount(...args),
  syncXBookmarks: (...args) => getApi().syncXBookmarks(...args),
  getStats: (...args) => getApi().getStats(...args),
}
