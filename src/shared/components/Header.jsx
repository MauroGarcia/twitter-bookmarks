import { useEffect, useRef, useState } from 'react'
import { Bell, Download, Settings } from 'lucide-react'
import { SearchBar } from './SearchBar'
import { useAppStore } from '../store/appStore'

export function Header({ onImport }) {
  const activeView = useAppStore((state) => state.activeView)
  const setActiveView = useAppStore((state) => state.setActiveView)
  const tabs = [
    { id: 'all', label: 'Tudo' },
    { id: 'favorites', label: 'Favoritos' },
    { id: 'archived', label: 'Arquivados' }
  ]
  const navRef = useRef(null)
  const labelRefs = useRef({})
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 })

  useEffect(() => {
    const updateIndicator = () => {
      const navElement = navRef.current
      const activeLabel = labelRefs.current[activeView]

      if (!navElement || !activeLabel) {
        setIndicatorStyle((current) => ({ ...current, opacity: 0 }))
        return
      }

      const navRect = navElement.getBoundingClientRect()
      const labelRect = activeLabel.getBoundingClientRect()

      setIndicatorStyle({
        left: labelRect.left - navRect.left,
        width: labelRect.width,
        opacity: 1
      })
    }

    updateIndicator()
    window.addEventListener('resize', updateIndicator)

    return () => window.removeEventListener('resize', updateIndicator)
  }, [activeView])

  return (
    <header className="sticky top-0 z-40 h-20 bg-[#0d0d1c]/60 backdrop-blur-md flex justify-between items-center px-12 py-4">
      <div className="flex items-center gap-6 flex-1">
        {/* Esquerda: Search */}
        <div className="relative w-full max-w-md">
          <SearchBar />
        </div>

        {/* Centro: Nav tabs */}
        <nav ref={navRef} className="relative ml-4 hidden items-center gap-8 lg:flex">
          <span
            className="pointer-events-none absolute bottom-0 h-[2px] rounded-full bg-[#00e3fd] transition-all duration-300 ease-out"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity
            }}
          />
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={
                activeView === tab.id
                  ? 'group relative cursor-pointer font-label text-sm font-medium text-[#00e3fd] transition-colors'
                  : 'group relative cursor-pointer font-label text-sm font-medium text-on-surface/70 transition-colors hover:text-primary'
              }
            >
              <span
                ref={(element) => {
                  labelRefs.current[tab.id] = element
                }}
                className="relative inline-block pb-1"
              >
                {tab.label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Direita: Ícones + Avatar */}
      <div className="flex items-center gap-4 ml-auto">
        <button
          onClick={onImport}
          className="flex items-center gap-2 rounded-layout bg-surface-container-high px-5 py-2 text-sm font-semibold text-primary transition-all hover:bg-surface-bright"
        >
          <Download size={20} />
          Importar
        </button>
        <button className="rounded-layout p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-secondary">
          <Settings size={20} />
        </button>
        <button className="rounded-layout p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-secondary">
          <Bell size={20} />
        </button>
        <div className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant/20"></div>
      </div>
    </header>
  )
}
