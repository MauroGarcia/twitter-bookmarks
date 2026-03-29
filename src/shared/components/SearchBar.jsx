import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { useDebounce } from '../hooks/useDebounce'
import { Input } from './ui/Input'

const HASH_TRIGGER_REGEX = /(?:^|\s)#([^\s#]*)$/

function stripPendingTagToken(value) {
  return `${value}`.replace(HASH_TRIGGER_REGEX, ' ')
}

function normalizeSearchText(value) {
  return stripPendingTagToken(value).replace(/\s+/g, ' ').trim()
}

function buildTagSuggestions(tags, selectedTags, query) {
  const normalizedQuery = `${query}`.trim().toLowerCase()
  const selectedTagSet = new Set(selectedTags.map((tag) => tag.toLowerCase()))

  return tags
    .filter((tag) => !selectedTagSet.has(tag.name.toLowerCase()))
    .filter((tag) => !normalizedQuery || tag.name.toLowerCase().includes(normalizedQuery))
    .slice(0, 6)
}

function TagsSearchInput() {
  const tagSearchQuery = useAppStore((state) => state.tagSearchQuery)
  const setTagSearchQuery = useAppStore((state) => state.setTagSearchQuery)
  const [inputValue, setInputValue] = useState(tagSearchQuery)
  const deferredInputValue = useDeferredValue(inputValue)
  const debouncedValue = useDebounce(deferredInputValue, 300)

  useEffect(() => {
    if (debouncedValue !== tagSearchQuery) {
      startTransition(() => {
        setTagSearchQuery(debouncedValue)
      })
    }
  }, [debouncedValue, tagSearchQuery, setTagSearchQuery])

  useEffect(() => {
    setInputValue(tagSearchQuery)
  }, [tagSearchQuery])

  return (
    <Input
      type="text"
      placeholder="Pesquisar tags, aliases ou padrões..."
      value={inputValue}
      onChange={(event) => setInputValue(event.target.value)}
      inputClassName="search-input appearance-none rounded-layout border-none bg-[#000000] py-2.5 shadow-none ring-0 transition-all focus:bg-[#000000]"
      icon={<span className="material-symbols-outlined text-[20px]">search</span>}
      trailing={
        inputValue ? (
          <button
            onClick={() => {
              setInputValue('')
              startTransition(() => setTagSearchQuery(''))
            }}
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

function BookmarkSearchInput() {
  const tags = useAppStore((state) => state.tags)
  const searchQuery = useAppStore((state) => state.searchQuery)
  const setSearchQuery = useAppStore((state) => state.setSearchQuery)
  const searchTagNames = useAppStore((state) => state.searchTagNames)
  const setSearchTagNames = useAppStore((state) => state.setSearchTagNames)
  const isLoading = useAppStore((state) => state.isLoading)
  const [inputValue, setInputValue] = useState(searchQuery)
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)
  const deferredInputValue = useDeferredValue(inputValue)
  const debouncedValue = useDebounce(deferredInputValue, 300)
  const triggerMatch = inputValue.match(HASH_TRIGGER_REGEX)
  const tagQuery = triggerMatch ? triggerMatch[1] : ''
  const showTagSuggestions = Boolean(triggerMatch)

  const suggestions = useMemo(
    () => buildTagSuggestions(tags, searchTagNames, tagQuery),
    [searchTagNames, tagQuery, tags]
  )

  useEffect(() => {
    const nextSearchText = normalizeSearchText(debouncedValue)

    if (nextSearchText !== searchQuery) {
      startTransition(() => {
        setSearchQuery(nextSearchText)
      })
    }
  }, [debouncedValue, searchQuery, setSearchQuery])

  useEffect(() => {
    if (!showTagSuggestions) {
      setIsSuggestionsOpen(false)
      return
    }

    setIsSuggestionsOpen(true)
  }, [showTagSuggestions, suggestions.length])

  const commitTag = (tagName) => {
    const normalizedName = `${tagName}`.trim()
    if (!normalizedName) return

    const nextTags = [...searchTagNames, normalizedName]
    const nextInputValue = stripPendingTagToken(inputValue).replace(/\s+$/, '')

    setSearchTagNames(nextTags)
    setInputValue(nextInputValue)
    setIsSuggestionsOpen(false)

    const nextSearchText = normalizeSearchText(nextInputValue)
    if (nextSearchText !== searchQuery) {
      startTransition(() => {
        setSearchQuery(nextSearchText)
      })
    }
  }

  const removeTag = (tagName) => {
    setSearchTagNames(searchTagNames.filter((currentTag) => currentTag !== tagName))
  }

  const handleClear = () => {
    setInputValue('')
    setIsSuggestionsOpen(false)
    startTransition(() => {
      setSearchQuery('')
      setSearchTagNames([])
    })
  }

  return (
    <div className="relative">
      <div className="flex min-h-[46px] flex-wrap items-center gap-2 rounded-layout bg-[#000000] pl-4 pr-12 shadow-none ring-1 ring-transparent transition-all focus-within:ring-1 focus-within:ring-secondary/40">
        <span className="material-symbols-outlined text-[20px] text-on-surface-variant/60">search</span>

        {searchTagNames.map((tagName) => (
          <span
            key={tagName}
            className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary"
          >
            #{tagName}
            <button
              type="button"
              onClick={() => removeTag(tagName)}
              className="text-secondary/70 transition-colors hover:text-secondary"
              aria-label={`Remover tag ${tagName}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}

        <input
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onFocus={() => {
            if (showTagSuggestions) {
              setIsSuggestionsOpen(true)
            }
          }}
          onBlur={() => {
            window.setTimeout(() => setIsSuggestionsOpen(false), 120)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Tab' && isSuggestionsOpen && suggestions.length > 0) {
              event.preventDefault()
              commitTag(suggestions[0].name)
              return
            }

            if (event.key === 'Backspace' && !inputValue && searchTagNames.length > 0) {
              const nextTags = searchTagNames.slice(0, -1)
              setSearchTagNames(nextTags)
            }
          }}
          placeholder="Pesquisar bookmarks, autores ou tags..."
          className="search-input min-w-[160px] flex-1 appearance-none border-none bg-transparent py-2.5 text-sm text-on-surface shadow-none outline-none ring-0 placeholder:text-on-surface-variant/40"
          aria-busy={isLoading}
          data-testid="search-input"
        />

        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {!showTagSuggestions && isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
          ) : inputValue || searchTagNames.length > 0 ? (
            <button
              onClick={handleClear}
              className="text-on-surface-variant transition-colors hover:text-on-surface"
              aria-label="Limpar busca"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          ) : null}
        </div>
      </div>

      {isSuggestionsOpen && showTagSuggestions && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-layout border border-outline-variant/10 bg-surface-container p-2 shadow-cyan">
          {suggestions.length > 0 ? (
            suggestions.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => commitTag(tag.name)}
                className="flex w-full items-center gap-3 rounded-layout px-3 py-2 text-left transition-colors hover:bg-surface-container-high"
              >
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: tag.color }} />
                <span className="font-semibold text-on-surface">#{tag.name}</span>
                <span className="ml-auto text-xs text-on-surface-variant">
                  {tag.count || 0} itens
                </span>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-on-surface-variant">
              Nenhuma tag corresponde a esse `#`.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function SearchBar() {
  const activeView = useAppStore((state) => state.activeView)

  if (activeView === 'tags') {
    return <TagsSearchInput />
  }

  return <BookmarkSearchInput />
}
