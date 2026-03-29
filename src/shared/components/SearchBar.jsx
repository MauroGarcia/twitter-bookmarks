import { useDeferredValue, useEffect, useState } from 'react'
import { useAppStore } from '../store/appStore'
import { useDebounce } from '../hooks/useDebounce'
import { Input } from './ui/Input'

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
    <Input
      type="text"
      placeholder="Pesquisar bookmarks, autores ou tags..."
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      aria-busy={isLoading}
      inputClassName="search-input appearance-none rounded-layout border-none bg-[#000000] py-2.5 shadow-none ring-0 transition-all focus:bg-[#000000] disabled:opacity-50"
      icon={<span className="material-symbols-outlined text-[20px]">search</span>}
      trailing={
        isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
        ) : inputValue ? (
          <button
            onClick={handleClear}
            className="text-on-surface-variant transition-colors hover:text-on-surface"
            aria-label="Limpar busca"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        ) : null
      }
      data-testid="search-input"
    />
  )
}
