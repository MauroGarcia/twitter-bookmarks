import { Search } from 'lucide-react'
import { useAppStore } from '../store/appStore'

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useAppStore()

  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 text-gray-400" size={20} />
      <input
        type="text"
        placeholder="Pesquisar bookmarks..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter focus:border-transparent"
      />
    </div>
  )
}
