import { useAppStore } from '../store/appStore'
import { BookmarkCard } from './BookmarkCard'

function formatCount(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace('.0', '')}k`
  }

  return `${value}`
}

function buildHighlights(bookmarks) {
  const uniqueAuthors = new Set(bookmarks.map((bookmark) => bookmark.author_handle).filter(Boolean)).size
  const mediaCount = bookmarks.filter((bookmark) => Boolean(bookmark.has_media)).length
  const linkCount = bookmarks.filter((bookmark) => {
    try {
      const urls = bookmark.urls ? JSON.parse(bookmark.urls) : []
      return Array.isArray(urls) && urls.length > 0
    } catch {
      return false
    }
  }).length

  return [
    {
      label: `${bookmarks.length} artifacts`,
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

export function BookmarkList({ onSelectBookmark }) {
  const { bookmarks, isLoading } = useAppStore()

  if (isLoading) {
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

  if (bookmarks.length === 0) {
    return (
      <section className="rounded-layout border border-outline-variant/10 bg-surface-container p-10 text-center shadow-cyan">
        <p className="font-headline text-3xl font-bold text-on-surface">Nenhum artifact encontrado</p>
        <p className="mx-auto mt-3 max-w-xl text-sm text-on-surface-variant">
          Importe um arquivo de bookmarks ou conecte sua conta do X para começar a preencher esta biblioteca.
        </p>
      </section>
    )
  }

  const highlights = buildHighlights(bookmarks)
  const topBookmarks = bookmarks.slice(0, 12)
  const totalLikes = bookmarks.reduce((sum, bookmark) => sum + (bookmark.like_count || 0), 0)

  return (
    <section className="space-y-10">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="font-label text-xs font-semibold uppercase tracking-[0.32em] text-primary/80">
            Dashboard Home
          </p>
          <h2 className="mt-2 font-headline text-4xl font-extrabold tracking-tight text-on-surface">
            Recent Artifacts
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-on-surface-variant">
            Curadoria viva dos seus bookmarks mais recentes, com mídia, links e autores reais carregados do SQLite local.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {highlights.map((item) => (
            <span
              key={item.label}
              className={
                item.tone === 'primary'
                  ? 'rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary'
                  : item.tone === 'secondary'
                    ? 'rounded-full border border-secondary/20 bg-secondary/10 px-4 py-1.5 text-xs font-bold text-secondary'
                    : item.tone === 'tertiary'
                      ? 'rounded-full border border-tertiary/20 bg-tertiary/10 px-4 py-1.5 text-xs font-bold text-tertiary'
                      : 'rounded-full bg-surface-container-high px-4 py-1.5 text-xs font-bold text-on-surface-variant'
              }
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {topBookmarks.map((bookmark, index) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              tags={bookmark.tags || []}
              variant={index === 1 ? 'feature' : index % 5 === 0 ? 'accent' : 'default'}
              className={index === 1 ? 'md:row-span-2' : ''}
              onClick={() => onSelectBookmark(bookmark)}
            />
          ))}
        </div>

        <aside className="rounded-layout border border-outline-variant/10 bg-surface-container p-6 shadow-cyan">
          <p className="font-label text-xs font-semibold uppercase tracking-[0.32em] text-secondary/80">
            Reading Pulse
          </p>
          <div className="mt-5 space-y-5">
            <div className="rounded-layout bg-surface-container-high p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">Loaded now</p>
              <p className="mt-2 font-headline text-4xl font-extrabold text-on-surface">{bookmarks.length}</p>
              <p className="mt-2 text-sm text-on-surface-variant">bookmarks prontos para explorar nesta home.</p>
            </div>

            <div className="rounded-layout bg-surface-container-high p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">Total likes</p>
              <p className="mt-2 font-headline text-4xl font-extrabold text-primary">{formatCount(totalLikes)}</p>
              <p className="mt-2 text-sm text-on-surface-variant">
                sinal agregado de relevância social entre os itens em destaque.
              </p>
            </div>

            <div className="rounded-layout bg-surface-container-high p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">What this proves</p>
              <ul className="mt-3 space-y-3 text-sm text-on-surface-variant">
                <li>A home já lê bookmarks reais do SQLite local.</li>
                <li>Mídia, autores e links entram no card sem mock visual separado.</li>
                <li>O próximo passo natural é ligar esse fluxo ao sync incremental com X.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
