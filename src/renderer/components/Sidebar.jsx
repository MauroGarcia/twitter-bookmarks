import { Plus, Bookmark } from 'lucide-react'
import { useAppStore } from '../store/appStore'

export function Sidebar({ onImport }) {
  const { tags, selectedTag, setSelectedTag, setImportDialog, stats } = useAppStore()

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white border-r border-gray-700 p-4 flex flex-col shadow-xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4 px-2">
          <Bookmark size={24} className="text-twitter-400" />
          <h1 className="text-xl font-bold">Meus Bookmarks</h1>
        </div>
        <p className="text-xs text-gray-400 px-2 mb-4">{stats.bookmarksCount} salvos</p>
        <button
          onClick={onImport}
          className="w-full btn-primary bg-gradient-to-r from-twitter-500 to-twitter-600 flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Importar
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-700 mb-6"></div>

      {/* Tags Section */}
      <div className="mb-3">
        <h3 className="section-title text-gray-300 mb-3 text-sm uppercase tracking-wider">
          Tags ({tags.length})
        </h3>
      </div>

      {/* Tags List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        <button
          onClick={() => setSelectedTag(null)}
          className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 font-medium ${
            selectedTag === null
              ? 'bg-gradient-to-r from-twitter-500 to-twitter-600 text-white shadow-lg'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Bookmark size={16} />
            <span>Todos</span>
            <span className="ml-auto text-xs bg-gray-700 px-2 py-0.5 rounded-full">{stats.bookmarksCount}</span>
          </div>
        </button>

        {tags.length > 0 ? (
          tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.name)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                selectedTag === tag.name
                  ? 'bg-gray-700 text-white ring-2 ring-offset-2 ring-offset-gray-800'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-offset-2 ring-offset-gray-800"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="flex-1 truncate">{tag.name}</span>
                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full flex-shrink-0">{tag.count}</span>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Nenhuma tag criada</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">Twitter Bookmarks v1.0.0</p>
      </div>
    </aside>
  )
}
