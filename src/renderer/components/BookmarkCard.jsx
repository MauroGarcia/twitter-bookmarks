import { Heart, Repeat2, ExternalLink, MessageCircle } from 'lucide-react'
import { TagBadge } from './TagBadge'

export function BookmarkCard({ bookmark, tags = [], onClick }) {
  return (
    <div
      onClick={onClick}
      className="card bg-white hover:bg-gradient-card border border-gray-100 rounded-xl p-5 cursor-pointer group"
    >
      <div className="flex gap-3 mb-4">
        {bookmark.author_avatar_url && (
          <img
            src={bookmark.author_avatar_url}
            alt={bookmark.author_name}
            className="w-12 h-12 rounded-full ring-2 ring-gray-100 group-hover:ring-twitter-200 transition-all"
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 group-hover:text-twitter-600 transition-colors">{bookmark.author_name}</h4>
          <p className="text-sm text-gray-500">@{bookmark.author_handle}</p>
        </div>
      </div>

      <p className="text-gray-800 text-sm mb-4 line-clamp-3 leading-relaxed group-hover:text-gray-900 transition-colors">
        {bookmark.full_text}
      </p>

      {tags.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-6 text-xs text-gray-500 pt-3 border-t border-gray-100">
        <button
          className="flex items-center gap-1.5 hover:text-twitter-500 hover:bg-twitter-50 px-2 py-1 rounded-lg transition-all duration-200"
          title="Likes"
        >
          <Heart size={16} className="group-hover:fill-current" />
          <span className="font-medium">{bookmark.like_count}</span>
        </button>
        <button
          className="flex items-center gap-1.5 hover:text-green-500 hover:bg-green-50 px-2 py-1 rounded-lg transition-all duration-200"
          title="Retweets"
        >
          <Repeat2 size={16} />
          <span className="font-medium">{bookmark.retweet_count}</span>
        </button>
        <a
          href={bookmark.tweet_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-twitter-500 hover:bg-twitter-50 px-2 py-1 rounded-lg transition-all duration-200 ml-auto"
          title="Abrir no Twitter"
        >
          <ExternalLink size={16} />
          <span className="font-medium hidden sm:inline">Twitter</span>
        </a>
      </div>
    </div>
  )
}
