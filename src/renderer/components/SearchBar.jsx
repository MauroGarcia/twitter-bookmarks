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
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-on-surface-variant/60" size={20} />
      <input
        type="text"
        placeholder="Pesquisar artefatos, autores ou tags..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={isLoading}
        className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg py-2.5 pl-12 pr-12 text-sm text-on-surface focus:ring-1 focus:ring-secondary/40 focus:outline-none placeholder:text-on-surface-variant/40 transition-all disabled:opacity-50"
        data-testid="search-input"
      />
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
        {inputValue && !isLoading && (
          <button
            onClick={handleClear}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Limpar busca"
          >
            <X size={18} />
          </button>
        )}
        {isLoading && (
          <div className="animate-spin h-5 w-5 border-2 border-secondary border-t-transparent rounded-full"></div>
        )}
      </div>
    </div>
  )
}
