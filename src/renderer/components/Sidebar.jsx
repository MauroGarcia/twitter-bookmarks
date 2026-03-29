import { Plus } from 'lucide-react'
import { useAppStore } from '../store/appStore'

export function Sidebar({ onImport }) {
  const { tags, selectedTag, setSelectedTag, stats } = useAppStore()

  return (
    <aside className="w-72 bg-[#121222]/80 backdrop-blur-xl rounded-r-xl sticky top-0 h-screen flex flex-col py-8 px-6 shadow-cyan z-50">
      {/* Logo */}
      <div className="mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-neon-gradient flex items-center justify-center text-xl">
          ✨
        </div>
        <div>
          <h1 className="font-headline text-2xl font-bold tracking-tighter text-primary">
            The Curator
          </h1>
          <p className="font-headline text-[10px] uppercase tracking-widest text-on-surface/40">
            Artifact Collector
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-2 mb-6">
        <button
          onClick={() => setSelectedTag(null)}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 font-headline font-bold ${
            selectedTag === null
              ? 'bg-surface-container-high text-secondary scale-105'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
          }`}
        >
          <span>📚</span>
          <span>Library</span>
        </button>

        {tags.length > 0 && (
          <>
            {/* Tags Section Title */}
            <div className="pt-4 pb-2 px-4">
              <h3 className="font-headline text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
                Tags ({tags.length})
              </h3>
            </div>

            {/* Tags List */}
            <div className="space-y-1">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTag(tag.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm ${
                    selectedTag === tag.name
                      ? 'bg-surface-container-high text-secondary font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="flex-1 truncate">{tag.name}</span>
                  <span className="text-xs bg-surface-container-highest px-2 py-0.5 rounded-full flex-shrink-0 text-on-surface-variant">
                    {tag.count}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* CTA Button */}
      <div className="mb-6">
        <button
          onClick={onImport}
          className="w-full py-4 rounded-lg bg-neon-gradient text-on-primary-fixed font-headline font-bold flex items-center justify-center gap-2 shadow-glow-sm hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus size={20} />
          Importar
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-outline-variant/10"></div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-outline-variant/10 text-center">
        <p className="text-xs text-on-surface-variant">The Curator v1.0.0</p>
      </div>
    </aside>
  )
}
