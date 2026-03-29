import { Settings, Bell } from 'lucide-react'
import { SearchBar } from './SearchBar'

export function Header() {
  return (
    <header className="sticky top-0 z-40 h-20 bg-[#0d0d1c]/60 backdrop-blur-md flex justify-between items-center px-8">
      {/* Esquerda: Search */}
      <div className="flex-1 max-w-md">
        <SearchBar />
      </div>

      {/* Centro: Nav tabs (opcional para futura implementação) */}
      <nav className="hidden lg:flex items-center gap-8 ml-8">
        <a href="#" className="font-label text-sm font-medium text-secondary border-b-2 border-secondary pb-1 transition-all">
          Tudo
        </a>
        <a href="#" className="font-label text-sm font-medium text-on-surface/70 hover:text-primary transition-all">
          Não lidos
        </a>
        <a href="#" className="font-label text-sm font-medium text-on-surface/70 hover:text-primary transition-all">
          Arquivados
        </a>
      </nav>

      {/* Direita: Ícones + Avatar */}
      <div className="flex items-center gap-4 ml-auto">
        <button className="text-on-surface-variant hover:text-secondary transition-colors p-2 hover:bg-surface-container-high rounded-lg">
          <Settings size={20} />
        </button>
        <button className="text-on-surface-variant hover:text-secondary transition-colors p-2 hover:bg-surface-container-high rounded-lg">
          <Bell size={20} />
        </button>
        <div className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant/20"></div>
      </div>
    </header>
  )
}
