import { Plus } from 'lucide-react'
import { MdAutoAwesomeMotion } from 'react-icons/md'
import { useAppStore } from '../store/appStore'

export function Sidebar({ onImport }) {
  const { tags, selectedTag, setSelectedTag } = useAppStore()

  return (
    <aside className="sticky top-0 z-50 flex h-screen w-72 flex-col rounded-r-layout bg-[#121222]/80 px-6 py-8 shadow-cyan backdrop-blur-xl">
      {/* Logo */}
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-layout bg-gradient-to-br from-[#bb9eff] to-[#874cff]">
          <MdAutoAwesomeMotion size={24} className="text-[#000000]" />
        </div>
        <div>
          <h1 className="font-headline text-2xl font-bold tracking-tighter text-[#bb9eff]">
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
          className={selectedTag === null
            ? 'flex w-full scale-105 items-center gap-4 rounded-layout bg-[#1e1e32] px-4 py-3 font-headline font-bold text-[#00e3fd] transition-all duration-300 hover:bg-[#24243a]'
            : 'flex w-full items-center gap-4 rounded-layout px-4 py-3 font-headline text-[#e6e3f9]/60 transition-colors duration-300 hover:bg-[#1e1e32] hover:text-[#00e3fd]'
          }
        >
          <span className="material-symbols-outlined">auto_awesome_motion</span>
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
                  className={selectedTag === tag.name
                    ? 'flex w-full items-center gap-3 rounded-layout bg-[#1e1e32] px-4 py-3 text-sm font-semibold text-[#00e3fd] transition-colors duration-300'
                    : 'flex w-full items-center gap-3 rounded-layout px-4 py-3 text-sm text-on-surface-variant transition-colors duration-300 hover:bg-[#1e1e32] hover:text-[#e6e3f9]'
                  }
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
          className="flex w-full items-center justify-center gap-2 rounded-layout bg-neon-gradient py-4 font-headline font-bold text-on-primary-fixed shadow-glow-sm transition-all hover:opacity-90 active:scale-95"
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
