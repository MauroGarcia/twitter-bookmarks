import { Heart, Repeat2, ExternalLink } from 'lucide-react'
import { TagBadge } from './TagBadge'

export function BookmarkCard({ bookmark, tags = [], onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-surface-container-high rounded-lg p-6 border border-outline-variant/10 hover:bg-surface-bright transition-all duration-300 shadow-cyan cursor-pointer group"
    >
      <div className="flex gap-3 mb-4">
        {bookmark.author_avatar_url && (
          <img
            src={bookmark.author_avatar_url}
            alt={bookmark.author_name}
            className="w-12 h-12 rounded-full ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all"
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-headline font-semibold text-on-surface group-hover:text-primary transition-colors">
            {bookmark.author_name}
          </h4>
          <p className="text-sm text-on-surface-variant">@{bookmark.author_handle}</p>
        </div>
      </div>

      <p className="font-body text-sm text-on-surface/80 mb-4 line-clamp-3 leading-relaxed group-hover:text-on-surface transition-colors">
        {bookmark.full_text}
      </p>

      {tags.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-6 text-xs text-on-surface-variant pt-4 border-t border-outline-variant/10">
        <button
          className="flex items-center gap-1.5 hover:text-error hover:bg-error/10 px-2 py-1 rounded-lg transition-all duration-200"
          title="Curtidas"
        >
          <Heart size={16} className="group-hover:fill-current" />
          <span className="font-medium">{bookmark.like_count}</span>
        </button>
        <button
          className="flex items-center gap-1.5 hover:text-secondary hover:bg-secondary/10 px-2 py-1 rounded-lg transition-all duration-200"
          title="Retweets"
        >
          <Repeat2 size={16} />
          <span className="font-medium">{bookmark.retweet_count}</span>
        </button>
        <a
          href={bookmark.tweet_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-primary hover:bg-primary/10 px-2 py-1 rounded-lg transition-all duration-200 ml-auto"
          title="Abrir no Twitter"
        >
          <ExternalLink size={16} />
          <span className="font-medium hidden sm:inline">Twitter</span>
        </a>
      </div>
    </div>
  )
}
