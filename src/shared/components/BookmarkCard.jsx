import { memo, useEffect, useState } from 'react'
import { Archive, ExternalLink, Images, Link2, Star } from 'lucide-react'
import { TagBadge } from './TagBadge'
import { Avatar } from './ui/Avatar'
import { Badge } from './ui/Badge'

const TWEET_TOKEN_REGEX = /(@\w+)|(https?:\/\/\S+)/g

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

function isLikelyArticleHeading(line) {
  const value = `${line || ''}`.trim()

  return Boolean(
    value &&
    value.length <= 90 &&
    !/[.:!?]$/.test(value) &&
    !value.startsWith('-') &&
    !value.startsWith('•') &&
    !value.startsWith('>')
  )
}

export const ArticleText = memo(function ArticleText({ text, className = '' }) {
  if (!text) return null

  const lines = text.split('\n')

  return (
    <div className={className}>
      {lines.map((line, index) => {
        const trimmed = line.trim()

        if (!trimmed) {
          return <div key={index} className="h-3" />
        }

        if (trimmed.startsWith('>')) {
          return (
            <blockquote
              key={index}
              className="my-3 border-l-2 border-secondary/40 pl-4 text-sm italic text-on-surface-variant"
            >
              {trimmed.replace(/^>\s?/, '')}
            </blockquote>
          )
        }

        if (/^(\d+\.|-|•)\s+/.test(trimmed)) {
          return (
            <div key={index} className="mt-2 flex gap-3 text-sm leading-relaxed text-on-surface-variant">
              <span className="pt-0.5 text-secondary">{trimmed.match(/^(\d+\.|-|•)/)?.[0] || '•'}</span>
              <TweetText text={trimmed.replace(/^(\d+\.|-|•)\s+/, '')} className="flex-1" />
            </div>
          )
        }

        if (isLikelyArticleHeading(trimmed)) {
          return (
            <p key={index} className="mt-4 text-base font-semibold text-on-surface">
              {trimmed}
            </p>
          )
        }

        return (
          <TweetText
            key={index}
            text={trimmed}
            className="mt-2 text-sm leading-relaxed text-on-surface-variant"
          />
        )
      })}
    </div>
  )
})

export function ArticlePreview({ article, compact = false, onImageClick }) {
  if (!article?.title && !article?.text) {
    return null
  }

  const articleImage = article.media_urls?.[0] || null
  const articleImages = article.media_urls || []

  return (
    <div className={`relative rounded-lg border border-outline-variant/20 bg-surface-container-highest/60 ${compact ? 'max-h-[26rem] overflow-hidden p-3' : 'p-4'}`}>
      {!compact && articleImage && (
        <div className={`mb-3 overflow-hidden rounded-lg border border-outline-variant/10 ${compact ? 'aspect-video' : 'aspect-[16/9]'}`}>
          <button type="button" className="block h-full w-full" onClick={() => onImageClick?.(articleImage)}>
            <img src={articleImage} alt={article.title || 'Article preview'} className="h-full w-full object-contain bg-black/20" />
          </button>
        </div>
      )}
      {article.title && (
        <p className={`font-headline font-semibold text-on-surface ${compact ? 'text-sm' : 'text-base'}`}>
          {article.title}
        </p>
      )}
      {article.text && (
        <ArticleText
          text={article.text}
          className={compact ? 'mt-2 max-h-48 overflow-hidden' : 'mt-2'}
        />
      )}
      {!compact && articleImages.length > 1 && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {articleImages.slice(1).map((imageUrl, index) => (
            <div key={`${imageUrl}-${index}`} className="aspect-video overflow-hidden rounded-lg border border-outline-variant/10">
              <button type="button" className="block h-full w-full" onClick={() => onImageClick?.(imageUrl)}>
                <img src={imageUrl} alt={`${article.title || 'Article'} image ${index + 2}`} className="h-full w-full object-contain bg-black/20" />
              </button>
            </div>
          ))}
        </div>
      )}
      {compact && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-surface-container-highest/95 to-transparent" />
      )}
    </div>
  )
}

export const TweetText = memo(function TweetText({ text, className = '' }) {
  if (!text) return null

  function renderLine(line) {
    const parts = []
    let lastIndex = 0
    let match

    TWEET_TOKEN_REGEX.lastIndex = 0
    while ((match = TWEET_TOKEN_REGEX.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: line.slice(lastIndex, match.index) })
      }
      if (match[1]) {
        parts.push({ type: 'mention', value: match[1] })
      } else {
        parts.push({ type: 'url', value: match[2] })
      }
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < line.length) {
      parts.push({ type: 'text', value: line.slice(lastIndex) })
    }

    return parts.map((part, i) => {
      if (part.type === 'mention') {
        return <span key={i} className="text-primary">{part.value}</span>
      }
      if (part.type === 'url') {
        return (
          <a
            key={i}
            href={part.value}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-primary hover:underline break-all"
          >
            {part.value}
          </a>
        )
      }
      return part.value
    })
  }

  const lines = text.split('\n')

  return (
    <p className={className}>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex}>
          {renderLine(line)}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      ))}
    </p>
  )
})

export const BookmarkCard = memo(function BookmarkCard({
  bookmark,
  tags = [],
  variant = 'default',
  className = '',
  onClick,
  onToggleFavorite,
  onToggleArchived
}) {
  const mediaUrls = bookmark.mediaUrls || []
  const article = bookmark.article_data || null
  const linkItems = bookmark.linkItems || []
  const coverImage = article ? null : (mediaUrls[0] || null)
  const [isFavoritingBurstVisible, setIsFavoritingBurstVisible] = useState(false)

  useEffect(() => {
    if (!isFavoritingBurstVisible) return undefined

    const timeoutId = window.setTimeout(() => {
      setIsFavoritingBurstVisible(false)
    }, 180)

    return () => window.clearTimeout(timeoutId)
  }, [isFavoritingBurstVisible])

  const handleFavoriteClick = (event) => {
    event.stopPropagation()

    if (!bookmark.is_favorite) {
      setIsFavoritingBurstVisible(true)
    }

    onToggleFavorite?.()
  }

  return (
    <article
      onClick={onClick}
      className={`group relative w-full cursor-pointer overflow-hidden rounded-layout border border-outline-variant/10 p-6 shadow-cyan transition-all duration-300 ${getCardTone(variant)} ${className}`}
      data-testid={`bookmark-card-${bookmark.id}`}
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
          <Avatar src={bookmark.author_avatar_url} name={bookmark.author_name} />

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-on-surface">{bookmark.author_name}</p>
            <p className="truncate text-xs text-on-surface-variant">@{bookmark.author_handle}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleFavoriteClick}
          className={`relative flex h-10 w-10 cursor-pointer items-center justify-center transition-all duration-150 ${
            bookmark.is_favorite
              ? 'text-[#ffb347] drop-shadow-[0_0_12px_rgba(255,179,71,0.35)]'
              : 'text-on-surface-variant hover:text-[#ffb347]'
          }`}
          title={bookmark.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          data-testid={`bookmark-favorite-${bookmark.id}`}
        >
          <Star
            size={20}
            className={`relative z-[1] transition-all duration-150 ${
              bookmark.is_favorite ? 'fill-current scale-110' : ''
            } ${isFavoritingBurstVisible ? 'scale-[1.38]' : 'scale-100'} ${
              isFavoritingBurstVisible ? 'ease-out' : ''
            }`}
          />
        </button>
      </div>

      <TweetText
        text={bookmark.full_text}
        className={`font-body leading-relaxed text-on-surface ${variant === 'feature' ? 'mb-4 text-base' : 'mb-4 text-sm'}`}
      />

      {article && (
        <div className="mb-5">
          <ArticlePreview article={article} compact />
        </div>
      )}

      {bookmark.quoted_tweet && (
        <div className="mb-5 rounded-lg border border-outline-variant/20 bg-surface-container-highest/60 p-3">
          <div className="mb-1.5 flex items-center gap-2">
            {bookmark.quoted_tweet.author_avatar_url ? (
              <img
                src={bookmark.quoted_tweet.author_avatar_url}
                alt={bookmark.quoted_tweet.author_name}
                className="h-5 w-5 rounded-full object-cover"
              />
            ) : null}
            <span className="text-xs font-bold text-on-surface">{bookmark.quoted_tweet.author_name}</span>
            <span className="text-xs text-on-surface-variant">@{bookmark.quoted_tweet.author_handle}</span>
            <span className="text-xs text-on-surface-variant">·</span>
            <span className="text-xs text-on-surface-variant">{formatTimestamp(bookmark.quoted_tweet.created_at)}</span>
          </div>
          <TweetText
            text={bookmark.quoted_tweet.full_text}
            className="text-xs leading-relaxed text-on-surface-variant"
          />
        </div>
      )}

      {(tags.length > 0 || linkItems.length > 0) && (
        <div className="mb-5 flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
          {tags.length === 0 && linkItems.slice(0, 2).map((item, index) => (
            <Badge
              key={`${bookmark.id}-link-${index}`}
              tone="secondary"
              size="sm"
            >
              linked
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4 text-[11px] text-on-surface-variant">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onToggleArchived?.()
            }}
            className={`cursor-pointer flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              bookmark.is_archived
                ? 'border-secondary/30 bg-secondary/10 text-secondary'
                : 'border-outline-variant/10 bg-surface-container-high text-on-surface-variant hover:text-secondary'
            }`}
            title={bookmark.is_archived ? 'Desarquivar' : 'Arquivar'}
            data-testid={`bookmark-archive-${bookmark.id}`}
          >
            <Archive size={14} />
            {bookmark.is_archived ? 'Arquivado' : 'Arquivar'}
          </button>
          {coverImage && (
            <Badge tone="secondary" icon={<Images size={14} />} />
          )}
          {!coverImage && linkItems.length > 0 && (
            <Badge tone="primary" icon={<Link2 size={14} />} />
          )}
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
})
