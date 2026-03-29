import { Bell, Download, Settings } from 'lucide-react'
import { SearchBar } from './SearchBar'

export function Header({ onImport }) {
  return (
    <header className="sticky top-0 z-40 h-20 bg-[#0d0d1c]/60 backdrop-blur-md flex justify-between items-center px-12 py-4">
      <div className="flex items-center gap-6 flex-1">
        {/* Esquerda: Search */}
        <div className="relative w-full max-w-md">
          <SearchBar />
        </div>

        {/* Centro: Nav tabs */}
        <nav className="hidden lg:flex items-center gap-8 ml-4">
          <a href="#" className="font-label text-sm font-medium text-[#00e3fd] border-b-2 border-[#00e3fd] pb-1">
            Tudo
          </a>
          <a href="#" className="font-label text-sm font-medium text-on-surface/70 hover:text-primary transition-colors">
            Não lidos
          </a>
          <a href="#" className="font-label text-sm font-medium text-on-surface/70 hover:text-primary transition-colors">
            Arquivados
          </a>
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
