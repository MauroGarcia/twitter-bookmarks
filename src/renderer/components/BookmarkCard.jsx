import { Heart, Repeat2, ExternalLink } from 'lucide-react'
import { TagBadge } from './TagBadge'

export function BookmarkCard({ bookmark, tags = [], onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex gap-3 mb-3">
        {bookmark.author_avatar_url && (
          <img
            src={bookmark.author_avatar_url}
            alt={bookmark.author_name}
            className="w-10 h-10 rounded-full"
          />
        )}
        <div className="flex-1">
          <h4 className="font-bold text-gray-900">{bookmark.author_name}</h4>
          <p className="text-sm text-gray-500">@{bookmark.author_handle}</p>
        </div>
      </div>

      <p className="text-gray-800 text-sm mb-3 line-clamp-3">{bookmark.full_text}</p>

      {tags.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <button
          className="flex items-center gap-1 hover:text-twitter transition-colors"
          title="Likes"
        >
          <Heart size={16} />
          {bookmark.like_count}
        </button>
        <button
          className="flex items-center gap-1 hover:text-twitter transition-colors"
          title="Retweets"
        >
          <Repeat2 size={16} />
          {bookmark.retweet_count}
        </button>
        <a
          href={bookmark.tweet_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-twitter transition-colors ml-auto"
          title="Abrir no Twitter"
        >
          <ExternalLink size={16} />
        </a>
      </div>
    </div>
  )
}
