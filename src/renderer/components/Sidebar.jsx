import { Plus } from 'lucide-react'
import { useAppStore } from '../store/appStore'

export function Sidebar({ onImport }) {
  const { tags, selectedTag, setSelectedTag, setImportDialog } = useAppStore()

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col">
      <div className="mb-6">
        <button
          onClick={onImport}
          className="w-full bg-twitter text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Importar Bookmarks
        </button>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-3">Tags ({tags.length})</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        <button
          onClick={() => setSelectedTag(null)}
          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
            selectedTag === null
              ? 'bg-twitter text-white'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos os bookmarks
        </button>

        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => setSelectedTag(tag.name)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
              selectedTag === tag.name
                ? 'bg-twitter text-white'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              <span className="flex-1">{tag.name}</span>
              <span className="text-xs text-gray-500">{tag.count}</span>
            </div>
          </button>
        ))}
      </div>
    </aside>
  )
}
