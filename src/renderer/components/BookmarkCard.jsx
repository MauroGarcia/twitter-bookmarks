import { ExternalLink, Heart, Images, Link2, Repeat2 } from 'lucide-react'
import { TagBadge } from './TagBadge'

function parseJsonList(value) {
  if (!value) return []
  if (Array.isArray(value)) return value

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function formatMetric(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace('.0', '')}k`
  }

  return `${value ?? 0}`
}

function formatTimestamp(value) {
  if (!value) return 'Unknown date'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

function getCardTone(variant) {
  if (variant === 'feature') {
    return 'bg-surface-container-high hover:bg-surface-bright'
  }

  if (variant === 'accent') {
    return 'bg-[linear-gradient(180deg,rgba(36,36,58,0.96)_0%,rgba(24,24,42,0.92)_100%)] hover:bg-surface-bright'
  }

  return 'bg-surface-container-high hover:bg-surface-bright'
}

export function BookmarkCard({ bookmark, tags = [], variant = 'default', className = '', onClick }) {
  const mediaUrls = parseJsonList(bookmark.media_urls)
  const linkItems = parseJsonList(bookmark.urls)
  const coverImage = mediaUrls[0] || null

  return (
    <article
      onClick={onClick}
      className={`group relative cursor-pointer overflow-hidden rounded-layout border border-outline-variant/10 p-6 shadow-cyan transition-all duration-300 ${getCardTone(variant)} ${className}`}
    >
      {coverImage && (
        <div className="mb-5 aspect-video overflow-hidden rounded-layout border border-outline-variant/10">
          <img
            src={coverImage}
            alt={bookmark.author_name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {bookmark.author_avatar_url ? (
            <img
              src={bookmark.author_avatar_url}
              alt={bookmark.author_name}
              className="h-10 w-10 rounded-full border border-outline-variant/30 object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/30 bg-surface-container-highest text-on-surface-variant">
              {bookmark.author_name?.[0] || '?'}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-on-surface">{bookmark.author_name}</p>
            <p className="truncate text-xs text-on-surface-variant">@{bookmark.author_handle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {coverImage && (
            <span className="rounded-full bg-secondary/10 p-2 text-secondary">
              <Images size={14} />
            </span>
          )}
          {!coverImage && linkItems.length > 0 && (
            <span className="rounded-full bg-primary/10 p-2 text-primary">
              <Link2 size={14} />
            </span>
          )}
        </div>
      </div>

      <p className={`font-body leading-relaxed text-on-surface ${variant === 'feature' ? 'mb-6 text-base' : 'mb-5 text-sm'} ${coverImage ? 'line-clamp-4' : 'line-clamp-5'}`}>
        {bookmark.full_text}
      </p>

      {(tags.length > 0 || linkItems.length > 0) && (
        <div className="mb-5 flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
          {tags.length === 0 && linkItems.slice(0, 2).map((item, index) => (
            <span
              key={`${bookmark.id}-link-${index}`}
              className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-secondary"
            >
              linked
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4 text-[11px] text-on-surface-variant">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Heart size={14} className="text-error" />
            {formatMetric(bookmark.like_count)}
          </span>
          <span className="flex items-center gap-1.5">
            <Repeat2 size={14} className="text-secondary" />
            {formatMetric(bookmark.retweet_count)}
          </span>
        </div>

        <a
          href={bookmark.tweet_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="flex items-center gap-1.5 rounded-layout px-2 py-1 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-secondary"
          title="Abrir no X/Twitter"
        >
          {formatTimestamp(bookmark.created_at)}
          <ExternalLink size={14} />
        </a>
      </div>
    </article>
  )
}
