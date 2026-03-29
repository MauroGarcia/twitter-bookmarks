import { memo, useCallback, useDeferredValue, useMemo, useEffect, useRef } from 'react'
import { useAppStore } from '../store/appStore'
import { BookmarkCard } from './BookmarkCard'
import { Badge } from './ui/Badge'
import { SectionHeader } from './ui/SectionHeader'
import { StatCard } from './ui/StatCard'

function formatCount(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace('.0', '')}k`
  }

  return `${value}`
}

function getBookmarkVariant(bookmarkId) {
  const normalizedId = `${bookmarkId || ''}`

  if (!normalizedId) {
    return 'default'
  }

  let hash = 0
  for (let index = 0; index < normalizedId.length; index += 1) {
    hash = ((hash * 31) + normalizedId.charCodeAt(index)) >>> 0
  }

  if (hash % 4 === 1) {
    return 'feature'
  }

  if (hash % 5 === 0) {
    return 'accent'
  }

  return 'default'
}

function buildHighlights(bookmarks) {
  const uniqueAuthors = new Set(bookmarks.map((bookmark) => bookmark.author_handle).filter(Boolean)).size
  const mediaCount = bookmarks.filter((bookmark) => Boolean(bookmark.has_media)).length
  const linkCount = bookmarks.filter((bookmark) => bookmark.linkItems?.length > 0).length

  return [
    {
      label: `${bookmarks.length} bookmarks`,
      tone: 'primary'
    },
    {
      label: `${uniqueAuthors} sources`,
      tone: 'secondary'
    },
    {
      label: `${mediaCount} with media`,
      tone: 'tertiary'
    },
    {
      label: `${linkCount} linked reads`,
      tone: 'default'
    }
  ]
}

const copyByView = {
  all: {
    title: 'Recent Bookmarks',
    description: 'Curadoria viva dos bookmarks ativos, com favoritos rápidos e arquivamento direto do mosaico.',
    emptyTitle: 'Nenhum bookmark ativo',
    emptyDescription: 'Arquive menos ou importe novos bookmarks para repovoar a biblioteca principal.'
  },
  favorites: {
    title: 'Favorite Bookmarks',
    description: 'Colecao priorizada dos bookmarks que merecem voltar para a mesa de trabalho.',
    emptyTitle: 'Nenhum favorito ainda',
    emptyDescription: 'Marque alguns cards com estrela para formar a sua shortlist.'
  },
  archived: {
    title: 'Archived Bookmarks',
    description: 'Itens guardados fora do fluxo principal, mas ainda acessiveis para consulta ou resgate.',
    emptyTitle: 'Nenhum item arquivado',
    emptyDescription: 'Arquive cards da home para limpar o fluxo e manter historico.'
  }
}

const BookmarkGridItem = memo(function BookmarkGridItem({
  bookmark,
  tags,
  variant,
  isTransitioning,
  onToggleFavorite,
  onToggleArchived,
  onSelectBookmark
}) {
  const handleToggleFavorite = useCallback(() => {
    onToggleFavorite(bookmark.id)
  }, [bookmark.id, onToggleFavorite])

  const handleToggleArchived = useCallback(() => {
    onToggleArchived(bookmark.id)
  }, [bookmark.id, onToggleArchived])

  const handleSelectBookmark = useCallback(() => {
    onSelectBookmark(bookmark)
  }, [bookmark, onSelectBookmark])

  return (
    <div
      className={`mb-8 break-inside-avoid transition-all duration-300 ${
        isTransitioning ? 'pointer-events-none scale-95 opacity-0 blur-[2px]' : ''
      }`}
    >
      <BookmarkCard
        bookmark={bookmark}
        tags={tags}
        variant={variant}
        onToggleFavorite={handleToggleFavorite}
        onToggleArchived={handleToggleArchived}
        onClick={handleSelectBookmark}
      />
    </div>
  )
})

export function BookmarkList({ onSelectBookmark }) {
  const bookmarks = useAppStore((state) => state.bookmarks)
  const activeView = useAppStore((state) => state.activeView)
  const isLoading = useAppStore((state) => state.isLoading)
  const isLoadingMore = useAppStore((state) => state.isLoadingMore)
  const hasMoreBookmarks = useAppStore((state) => state.hasMoreBookmarks)
  const transitioningBookmarkIds = useAppStore((state) => state.transitioningBookmarkIds)
  const loadMoreBookmarks = useAppStore((state) => state.loadMoreBookmarks)
  const toggleBookmarkFavorite = useAppStore((state) => state.toggleBookmarkFavorite)
  const toggleBookmarkArchived = useAppStore((state) => state.toggleBookmarkArchived)
  const sentinelRef = useRef(null)
  const renderedBookmarks = useDeferredValue(bookmarks)

  const currentCopy = copyByView[activeView] || copyByView.all

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    let scrollParent = sentinel.parentElement
    while (scrollParent && scrollParent !== document.body) {
      const { overflowY, overflow } = window.getComputedStyle(scrollParent)
      if (overflowY === 'auto' || overflowY === 'scroll' || overflow === 'auto' || overflow === 'scroll') break
      scrollParent = scrollParent.parentElement
    }

    const root = scrollParent !== document.body ? scrollParent : null

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreBookmarks && !isLoadingMore) {
          loadMoreBookmarks()
        }
      },
      { root, rootMargin: '200px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMoreBookmarks, isLoadingMore, loadMoreBookmarks])

  const highlights = useMemo(() => buildHighlights(renderedBookmarks), [renderedBookmarks])
  const transitioningBookmarkIdSet = useMemo(
    () => new Set(transitioningBookmarkIds),
    [transitioningBookmarkIds]
  )
  const totalLikes = useMemo(
    () => renderedBookmarks.reduce((sum, bookmark) => sum + (bookmark.like_count || 0), 0),
    [renderedBookmarks]
  )

  if (isLoading && bookmarks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div className="space-y-3">
            <div className="h-10 w-72 rounded-layout bg-surface-container-high" />
            <div className="h-5 w-96 rounded-layout bg-surface-container-highest/60" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-28 rounded-full bg-surface-container-high" />
            <div className="h-9 w-28 rounded-full bg-surface-container-high" />
            <div className="h-9 w-28 rounded-full bg-surface-container-high" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className={`rounded-layout border border-outline-variant/10 bg-surface-container-high p-6 shadow-cyan ${
                index === 1 ? 'md:row-span-2' : ''
              }`}
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-surface-container-highest" />
                <div className="space-y-2">
                  <div className="h-4 w-28 rounded-full bg-surface-container-highest" />
                  <div className="h-3 w-20 rounded-full bg-surface-container-highest/70" />
                </div>
              </div>
              {index === 1 && <div className="mb-5 aspect-video rounded-layout bg-surface-container-highest" />}
              <div className="space-y-3">
                <div className="h-4 w-full rounded-full bg-surface-container-highest/80" />
                <div className="h-4 w-11/12 rounded-full bg-surface-container-highest/80" />
                <div className="h-4 w-8/12 rounded-full bg-surface-container-highest/80" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!isLoading && renderedBookmarks.length === 0) {
    return (
      <section className="rounded-layout border border-outline-variant/10 bg-surface-container p-10 text-center shadow-cyan">
        <p className="font-headline text-3xl font-bold text-on-surface">{currentCopy.emptyTitle}</p>
        <p className="mx-auto mt-3 max-w-xl text-sm text-on-surface-variant">
          {currentCopy.emptyDescription}
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-10">
      <SectionHeader
        label="Dashboard Home"
        title={currentCopy.title}
        description={currentCopy.description}
        actions={highlights.map((item) => (
          <Badge key={item.label} tone={item.tone}>
            {item.label}
          </Badge>
        ))}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <div className="columns-1 gap-8 md:columns-2 xl:columns-3 [column-gap:2rem]">
            {renderedBookmarks.map((bookmark, index) => (
              <BookmarkGridItem
                key={bookmark.id}
                bookmark={bookmark}
                tags={bookmark.tags || []}
                variant={getBookmarkVariant(bookmark.id)}
                isTransitioning={transitioningBookmarkIdSet.has(bookmark.id)}
                onToggleFavorite={toggleBookmarkFavorite}
                onToggleArchived={toggleBookmarkArchived}
                onSelectBookmark={onSelectBookmark}
              />
            ))}
          </div>
          <div ref={sentinelRef}>
            {(hasMoreBookmarks || isLoadingMore) && (
              <div className="flex justify-center py-6">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-layout border border-outline-variant/10 bg-surface-container p-6 shadow-cyan">
          <p className="font-label text-xs font-semibold uppercase tracking-[0.32em] text-secondary/80">
            Reading Pulse
          </p>
          <div className="mt-5 space-y-5">
            <StatCard
              label="Loaded now"
              value={renderedBookmarks.length}
              description="bookmarks prontos para explorar nesta home."
            />

            <StatCard
              label="Total likes"
              value={formatCount(totalLikes)}
              color="primary"
              description="sinal agregado de relevância social entre os itens em destaque."
            />

            <StatCard label="What this proves">
              <ul className="mt-3 space-y-3 text-sm text-on-surface-variant">
                <li>A home já lê bookmarks reais do SQLite local.</li>
                <li>Mídia, autores e links entram no card sem mock visual separado.</li>
                <li>O próximo passo natural é ligar esse fluxo ao sync incremental com X.</li>
              </ul>
            </StatCard>
          </div>
        </aside>
      </div>
    </section>
  )
}
