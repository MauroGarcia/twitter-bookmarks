import { useDeferredValue, useEffect, useState } from 'react'
import { useAppStore } from '../store/appStore'
import { useDebounce } from '../hooks/useDebounce'

export function SearchBar() {
  const searchQuery = useAppStore((state) => state.searchQuery)
  const setSearchQuery = useAppStore((state) => state.setSearchQuery)
  const isLoading = useAppStore((state) => state.isLoading)
  const [inputValue, setInputValue] = useState(searchQuery)
  const deferredInputValue = useDeferredValue(inputValue)
  const debouncedValue = useDebounce(deferredInputValue, 300)

  useEffect(() => {
    if (debouncedValue !== searchQuery) {
      setSearchQuery(debouncedValue)
    }
  }, [debouncedValue, searchQuery, setSearchQuery])

  const handleClear = () => {
    setInputValue('')
    setSearchQuery('')
  }

  return (
    <div className="relative w-full">
      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[20px]">
        search
      </span>
      <input
        type="text"
        placeholder="Pesquisar artefatos, autores ou tags..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        aria-busy={isLoading}
        className="search-input w-full appearance-none rounded-layout border-none bg-[#000000] py-2.5 pl-12 pr-12 text-sm text-on-surface shadow-none outline-none ring-0 transition-all placeholder:text-on-surface-variant/40 focus:bg-[#000000] focus:outline-none focus:ring-1 focus:ring-secondary/40 disabled:opacity-50"
        data-testid="search-input"
      />
      {inputValue && !isLoading && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="Limpar busca"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      )}
      {isLoading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin h-5 w-5 border-2 border-secondary border-t-transparent rounded-full" />
      )}
    </div>
  )
}
