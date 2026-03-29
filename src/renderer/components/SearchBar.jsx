import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { useDebounce } from '../hooks/useDebounce'

export function SearchBar() {
  const { searchQuery, setSearchQuery, isLoading } = useAppStore()
  const [inputValue, setInputValue] = useState(searchQuery)
  const debouncedValue = useDebounce(inputValue, 300)

  useEffect(() => {
    setSearchQuery(debouncedValue)
  }, [debouncedValue, setSearchQuery])

  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  const handleClear = () => {
    setInputValue('')
    setSearchQuery('')
  }

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      <input
        type="text"
        placeholder="🔍 Pesquisar por texto, autor ou tag..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={isLoading}
        className="input-field w-full pl-12 pr-12 py-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-500 focus:border-transparent transition-all disabled:opacity-50"
        data-testid="search-input"
      />
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
        {inputValue && !isLoading && (
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Limpar busca"
          >
            <X size={18} />
          </button>
        )}
        {isLoading && (
          <div className="animate-spin h-5 w-5 border-2 border-twitter-500 border-t-transparent rounded-full"></div>
        )}
      </div>
    </div>
  )
}
