import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { useDebounce } from '../hooks/useDebounce'
import { Input } from './ui/Input'

const HASH_TRIGGER_REGEX = /(?:^|\s)#([^\s#]*)$/
const AUTHOR_TRIGGER_REGEX = /(?:^|\s)@([^\s@]*)$/
const MAX_VISIBLE_CHIPS = 2
const MAX_SUGGESTION_RESULTS = 6
const SUGGESTION_INDEX_TOKEN_SIZE = 3

function normalizeSuggestionValue(value) {
  return `${value}`.trim().toLowerCase()
}

function collectSuggestionTokens(value) {
  const normalizedValue = normalizeSuggestionValue(value)

  if (!normalizedValue) {
    return []
  }

  const tokens = new Set()

  for (let start = 0; start < normalizedValue.length; start += 1) {
    for (
      let size = 1;
      size <= SUGGESTION_INDEX_TOKEN_SIZE && start + size <= normalizedValue.length;
      size += 1
    ) {
      tokens.add(normalizedValue.slice(start, start + size))
    }
  }

  return Array.from(tokens)
}

function buildSuggestionIndex(items, buildSearchValue, buildKey) {
  const records = items.map((item) => ({
    item,
    key: normalizeSuggestionValue(buildKey(item)),
    searchValue: normalizeSuggestionValue(buildSearchValue(item))
  }))
  const tokenMap = new Map()

  records.forEach((record) => {
    collectSuggestionTokens(record.searchValue).forEach((token) => {
      const currentEntries = tokenMap.get(token)
      if (currentEntries) {
        currentEntries.push(record)
        return
      }

      tokenMap.set(token, [record])
    })
  })

  return {
    records,
    tokenMap
  }
}

function getIndexedSuggestionCandidates(index, query) {
  const normalizedQuery = normalizeSuggestionValue(query)

  if (!normalizedQuery) {
    return index.records
  }

  return index.tokenMap.get(normalizedQuery.slice(0, SUGGESTION_INDEX_TOKEN_SIZE)) || []
}

function stripPendingTagToken(value) {
  return `${value}`.replace(HASH_TRIGGER_REGEX, ' ')
}

function stripPendingAuthorToken(value) {
  return `${value}`.replace(AUTHOR_TRIGGER_REGEX, ' ')
}

function normalizeSearchText(value) {
  return stripPendingAuthorToken(stripPendingTagToken(value)).replace(/\s+/g, ' ').trim()
}

function buildTagSuggestions(tagIndex, selectedTags, query) {
  const normalizedQuery = normalizeSuggestionValue(query)
  const selectedTagSet = new Set(selectedTags.map((tag) => normalizeSuggestionValue(tag)))

  return getIndexedSuggestionCandidates(tagIndex, normalizedQuery)
    .filter((record) => !selectedTagSet.has(record.key))
    .filter((record) => !normalizedQuery || record.searchValue.includes(normalizedQuery))
    .slice(0, MAX_SUGGESTION_RESULTS)
    .map((record) => record.item)
}

function buildAuthorSuggestions(authorIndex, selectedAuthors, query) {
  const normalizedQuery = normalizeSuggestionValue(query)
  const selectedAuthorSet = new Set(selectedAuthors.map((author) => normalizeSuggestionValue(author)))

  return getIndexedSuggestionCandidates(authorIndex, normalizedQuery)
    .filter((record) => record.key)
    .filter((record) => !selectedAuthorSet.has(record.key))
    .filter((record) => !normalizedQuery || record.searchValue.includes(normalizedQuery))
    .slice(0, MAX_SUGGESTION_RESULTS)
    .map((record) => record.item)
}

function splitVisibleChips(items) {
  return {
    visible: items.slice(0, MAX_VISIBLE_CHIPS),
    hiddenCount: Math.max(0, items.length - MAX_VISIBLE_CHIPS)
  }
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
  const authors = useAppStore((state) => state.authors)
  const tags = useAppStore((state) => state.tags)
  const searchQuery = useAppStore((state) => state.searchQuery)
  const setSearchQuery = useAppStore((state) => state.setSearchQuery)
  const searchTagNames = useAppStore((state) => state.searchTagNames)
  const setSearchTagNames = useAppStore((state) => state.setSearchTagNames)
  const searchAuthorHandles = useAppStore((state) => state.searchAuthorHandles)
  const setSearchAuthorHandles = useAppStore((state) => state.setSearchAuthorHandles)
  const isLoading = useAppStore((state) => state.isLoading)
  const [inputValue, setInputValue] = useState(searchQuery)
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)
  const deferredInputValue = useDeferredValue(inputValue)
  const debouncedValue = useDebounce(deferredInputValue, 300)
  const tagTriggerMatch = inputValue.match(HASH_TRIGGER_REGEX)
  const authorTriggerMatch = inputValue.match(AUTHOR_TRIGGER_REGEX)
  const tagQuery = tagTriggerMatch ? tagTriggerMatch[1] : ''
  const authorQuery = authorTriggerMatch ? authorTriggerMatch[1] : ''
  const activeTrigger = tagTriggerMatch ? 'tag' : authorTriggerMatch ? 'author' : null
  const tagSuggestionIndex = useMemo(
    () => buildSuggestionIndex(tags, (tag) => tag.name, (tag) => tag.name),
    [tags]
  )
  const authorSuggestionIndex = useMemo(
    () => buildSuggestionIndex(
      authors,
      (author) => `${author.handle || ''} ${author.name || ''}`,
      (author) => author.handle || ''
    ),
    [authors]
  )

  const tagSuggestions = useMemo(
    () => buildTagSuggestions(tagSuggestionIndex, searchTagNames, tagQuery),
    [searchTagNames, tagQuery, tagSuggestionIndex]
  )
  const authorSuggestions = useMemo(
    () => buildAuthorSuggestions(authorSuggestionIndex, searchAuthorHandles, authorQuery),
    [authorQuery, authorSuggestionIndex, searchAuthorHandles]
  )
  const hasSuggestions = activeTrigger === 'tag'
    ? tagSuggestions.length > 0
    : authorSuggestions.length > 0
  const visibleTagChips = splitVisibleChips(searchTagNames)
  const visibleAuthorChips = splitVisibleChips(searchAuthorHandles)

  useEffect(() => {
    const nextSearchText = normalizeSearchText(debouncedValue)

    if (nextSearchText !== searchQuery) {
      startTransition(() => {
        setSearchQuery(nextSearchText)
      })
    }
  }, [debouncedValue, searchQuery, setSearchQuery])

  useEffect(() => {
    if (!activeTrigger) {
      setIsSuggestionsOpen(false)
      return
    }

    setIsSuggestionsOpen(true)
  }, [activeTrigger, hasSuggestions])

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

  const commitAuthor = (authorHandle) => {
    const normalizedHandle = `${authorHandle}`.trim()
    if (!normalizedHandle) return

    const nextAuthors = [...searchAuthorHandles, normalizedHandle]
    const nextInputValue = stripPendingAuthorToken(inputValue).replace(/\s+$/, '')

    setSearchAuthorHandles(nextAuthors)
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

  const removeAuthor = (authorHandle) => {
    setSearchAuthorHandles(searchAuthorHandles.filter((currentAuthor) => currentAuthor !== authorHandle))
  }

  const handleClear = () => {
    setInputValue('')
    setIsSuggestionsOpen(false)
    startTransition(() => {
      setSearchQuery('')
      setSearchTagNames([])
      setSearchAuthorHandles([])
    })
  }

  return (
    <div className="relative">
      <div className="flex h-[46px] items-center gap-2 overflow-hidden rounded-layout bg-[#000000] pl-4 pr-12 shadow-none ring-1 ring-transparent transition-all focus-within:ring-1 focus-within:ring-secondary/40">
        <span className="material-symbols-outlined text-[20px] text-on-surface-variant/60">search</span>

        {visibleTagChips.visible.map((tagName) => (
          <span
            key={tagName}
            className="inline-flex h-7 shrink-0 items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary"
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

        {visibleTagChips.hiddenCount > 0 && (
          <span className="inline-flex h-7 shrink-0 items-center rounded-full border border-secondary/15 bg-secondary/5 px-2.5 text-[11px] font-bold text-secondary/80">
            +{visibleTagChips.hiddenCount}
          </span>
        )}

        {visibleAuthorChips.visible.map((authorHandle) => (
          <span
            key={authorHandle}
            className="inline-flex h-7 shrink-0 items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary"
          >
            @{authorHandle}
            <button
              type="button"
              onClick={() => removeAuthor(authorHandle)}
              className="text-primary/70 transition-colors hover:text-primary"
              aria-label={`Remover autor ${authorHandle}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}

        {visibleAuthorChips.hiddenCount > 0 && (
          <span className="inline-flex h-7 shrink-0 items-center rounded-full border border-primary/15 bg-primary/5 px-2.5 text-[11px] font-bold text-primary/80">
            +{visibleAuthorChips.hiddenCount}
          </span>
        )}

        <input
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onFocus={() => {
            if (activeTrigger) {
              setIsSuggestionsOpen(true)
            }
          }}
          onBlur={() => {
            window.setTimeout(() => setIsSuggestionsOpen(false), 120)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Tab' && isSuggestionsOpen) {
              event.preventDefault()
              if (activeTrigger === 'tag' && tagSuggestions.length > 0) {
                commitTag(tagSuggestions[0].name)
              } else if (activeTrigger === 'author' && authorSuggestions.length > 0) {
                commitAuthor(authorSuggestions[0].handle)
              }
              return
            }

            if (event.key === 'Backspace' && !inputValue) {
              if (searchAuthorHandles.length > 0) {
                setSearchAuthorHandles(searchAuthorHandles.slice(0, -1))
                return
              }

              if (searchTagNames.length > 0) {
                setSearchTagNames(searchTagNames.slice(0, -1))
              }
            }
          }}
          placeholder="Pesquisar bookmarks, autores ou tags..."
          className="search-input min-w-[180px] flex-1 appearance-none border-none bg-transparent py-2.5 text-sm text-on-surface shadow-none outline-none ring-0 placeholder:text-on-surface-variant/40"
          aria-busy={isLoading}
          data-testid="search-input"
        />

        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {!activeTrigger && isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
          ) : inputValue || searchTagNames.length > 0 || searchAuthorHandles.length > 0 ? (
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

      {isSuggestionsOpen && activeTrigger && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-layout border border-outline-variant/10 bg-surface-container p-2 shadow-cyan">
          {activeTrigger === 'tag' && tagSuggestions.length > 0 ? (
            tagSuggestions.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => commitTag(tag.name)}
                className="flex w-full items-center gap-3 rounded-layout px-3 py-2 text-left transition-colors hover:bg-surface-container-high"
                data-testid={`tag-suggestion-${normalizeSuggestionValue(tag.name)}`}
              >
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: tag.color }} />
                <span className="font-semibold text-on-surface">#{tag.name}</span>
                <span className="ml-auto text-xs text-on-surface-variant">
                  {tag.count || 0} itens
                </span>
              </button>
            ))
          ) : activeTrigger === 'author' && authorSuggestions.length > 0 ? (
            authorSuggestions.map((author) => (
              <button
                key={author.handle}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => commitAuthor(author.handle)}
                className="flex w-full items-center gap-3 rounded-layout px-3 py-2 text-left transition-colors hover:bg-surface-container-high"
                data-testid={`author-suggestion-${normalizeSuggestionValue(author.handle)}`}
              >
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary/10 px-2 text-[10px] font-bold text-primary">
                  @
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-on-surface">@{author.handle}</p>
                  {author.name && <p className="truncate text-xs text-on-surface-variant">{author.name}</p>}
                </div>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-on-surface-variant">
              {activeTrigger === 'tag'
                ? 'Nenhuma tag corresponde a esse `#`.'
                : 'Nenhum autor corresponde a esse `@`.'}
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
