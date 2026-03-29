import { Settings, Bell } from 'lucide-react'
import { SearchBar } from './SearchBar'

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between bg-[#0d0d1c]/60 px-12 py-4 backdrop-blur-md">
      <div className="flex flex-1 items-center gap-6">
        <div className="relative w-full max-w-md">
          <SearchBar />
        </div>

        <nav className="ml-4 hidden items-center gap-8 lg:flex">
          <a href="#" className="border-b-2 border-[#00e3fd] pb-1 font-label text-sm font-medium text-[#00e3fd]">
            Tudo
          </a>
          <a href="#" className="font-label text-sm font-medium text-on-surface/70 transition-colors hover:text-primary">
            Não lidos
          </a>
          <a href="#" className="font-label text-sm font-medium text-on-surface/70 transition-colors hover:text-primary">
            Arquivados
          </a>
        </nav>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <button className="rounded-layout p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-secondary">
          <Settings size={20} />
        </button>
        <button className="rounded-layout p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-secondary">
          <Bell size={20} />
        </button>
        <div className="h-9 w-9 rounded-full border border-outline-variant/20 bg-surface-container-high"></div>
      </div>
    </header>
  )
}
