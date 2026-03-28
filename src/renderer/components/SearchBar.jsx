import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { useDebounce } from '../hooks/useDebounce'

export function SearchBar() {
  const { searchQuery, setSearchQuery, isLoading } = useAppStore()
  const [inputValue, setInputValue] = useState(searchQuery)
  const debouncedValue = useDebounce(inputValue, 300)

  // Atualizar searchQuery quando valor foi debounced
  useEffect(() => {
    setSearchQuery(debouncedValue)
  }, [debouncedValue, setSearchQuery])

  // Sincronizar com store quando searchQuery muda externamente
  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 text-gray-400" size={20} />
      <input
        type="text"
        placeholder="Pesquisar bookmarks..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={isLoading}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter focus:border-transparent disabled:opacity-50"
        data-testid="search-input"
      />
      {isLoading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin h-5 w-5 border-2 border-twitter border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  )
}
