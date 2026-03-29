import { useState, useEffect } from 'react'
import { X, Heart, Repeat2, ExternalLink, Save, Trash2 } from 'lucide-react'
import { TagBadge } from './TagBadge'
import { TagSelector } from './TagSelector'
import { ConfirmDialog } from './ConfirmDialog'
import { TweetText } from './BookmarkCard'
import { useAppStore } from '../store/appStore'
import { api } from '../services/api'

export function TweetDetail({ bookmark, tags = [], onClose }) {
  const [note, setNote] = useState('')
  const [selectedTags, setSelectedTags] = useState(tags.map(t => t.id))
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [isEditingTags, setIsEditingTags] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { loadBookmarks } = useAppStore()

  useEffect(() => {
    if (bookmark) {
      loadNote()
    }
  }, [bookmark])

  const loadNote = async () => {
    try {
      const noteData = await api.getNote(bookmark.id)
      if (noteData) {
        setNote(noteData.content)
      }
    } catch (error) {
      console.error('Erro ao carregar nota:', error)
    }
  }

  const handleSaveNote = async () => {
    try {
      await api.upsertNote(bookmark.id, note)
      setIsEditingNote(false)
    } catch (error) {
      console.error('Erro ao salvar nota:', error)
    }
  }

  const handleSaveTags = async () => {
    try {
      await api.setBookmarkTags(bookmark.id, selectedTags)
      setIsEditingTags(false)
      await loadBookmarks()
    } catch (error) {
      console.error('Erro ao salvar tags:', error)
    }
  }

  const handleDeleteBookmark = async () => {
    try {
      await api.deleteBookmark(bookmark.id)
      await loadBookmarks()
      setShowDeleteConfirm(false)
      onClose()
    } catch (error) {
      console.error('Erro ao deletar bookmark:', error)
    }
  }

  if (!bookmark) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-cyan border border-outline-variant/10">
        <div className="sticky top-0 bg-surface-container p-6 flex items-center justify-between border-b border-outline-variant/10">
          <h2 className="font-headline text-lg font-bold text-on-surface">Detalhes do Bookmark</h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tweet Info */}
          <div className="border-b border-outline-variant/10 pb-4">
            <div className="flex gap-3 mb-3">
              {bookmark.author_avatar_url && (
                <img
                  src={bookmark.author_avatar_url}
                  alt={bookmark.author_name}
                  className="w-12 h-12 rounded-full ring-1 ring-primary/20"
                />
              )}
              <div className="flex-1">
                <h3 className="font-headline font-bold text-on-surface">{bookmark.author_name}</h3>
                <p className="text-sm text-on-surface-variant">@{bookmark.author_handle}</p>
              </div>
            </div>
            <TweetText text={bookmark.full_text} className="font-body text-on-surface/80 mb-3" />

            {bookmark.mediaUrls?.length > 0 && (
              <div className="mb-3 overflow-hidden rounded-lg border border-outline-variant/10">
                <img
                  src={bookmark.mediaUrls[0]}
                  alt={bookmark.author_name}
                  className="w-full object-cover"
                />
              </div>
            )}

            {bookmark.quoted_tweet && (
              <div className="mb-3 rounded-lg border border-outline-variant/20 bg-surface-container-highest/60 p-3">
                <div className="mb-1.5 flex items-center gap-2">
                  {bookmark.quoted_tweet.author_avatar_url && (
                    <img
                      src={bookmark.quoted_tweet.author_avatar_url}
                      alt={bookmark.quoted_tweet.author_name}
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  )}
                  <span className="text-xs font-bold text-on-surface">{bookmark.quoted_tweet.author_name}</span>
                  <span className="text-xs text-on-surface-variant">@{bookmark.quoted_tweet.author_handle}</span>
                  <span className="text-xs text-on-surface-variant">·</span>
                  <span className="text-xs text-on-surface-variant">
                    {bookmark.quoted_tweet.created_at
                      ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(bookmark.quoted_tweet.created_at))
                      : ''}
                  </span>
                </div>
                <TweetText text={bookmark.quoted_tweet.full_text} className="text-xs leading-relaxed text-on-surface-variant" />
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-on-surface-variant">
              <button className="flex items-center gap-1 hover:text-error transition-colors">
                <Heart size={16} />
                {bookmark.like_count}
              </button>
              <button className="flex items-center gap-1 hover:text-secondary transition-colors">
                <Repeat2 size={16} />
                {bookmark.retweet_count}
              </button>
              <a
                href={bookmark.tweet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary transition-colors ml-auto"
              >
                <ExternalLink size={16} />
                Ver no Twitter
              </a>
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-headline font-semibold text-on-surface">Tags</h4>
              {!isEditingTags && (
                <button
                  onClick={() => setIsEditingTags(true)}
                  className="text-sm text-secondary hover:text-primary transition-colors"
                >
                  Editar
                </button>
              )}
            </div>

            {isEditingTags ? (
              <div className="space-y-3">
                <TagSelector selectedTagIds={selectedTags} onChange={setSelectedTags} />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveTags}
                    className="flex-1 bg-neon-gradient text-on-primary-fixed py-2 rounded-lg font-headline font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    Salvar
                  </button>
                  <button
                    onClick={() => setIsEditingTags(false)}
                    className="flex-1 bg-surface-container-high text-on-surface-variant py-2 rounded-lg font-headline font-bold hover:text-on-surface transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
                {tags.length === 0 && <p className="text-on-surface-variant text-sm">Nenhuma tag</p>}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-headline font-semibold text-on-surface">Notas Pessoais</h4>
              {!isEditingNote && (
                <button
                  onClick={() => setIsEditingNote(true)}
                  className="text-sm text-secondary hover:text-primary transition-colors"
                >
                  Editar
                </button>
              )}
            </div>

            {isEditingNote ? (
              <div className="space-y-3">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full h-32 p-3 bg-surface-container-lowest border border-outline-variant/20 rounded-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary/40 placeholder:text-on-surface-variant/40"
                  placeholder="Adicione suas notas pessoais..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNote}
                    className="flex-1 bg-neon-gradient text-on-primary-fixed py-2 rounded-lg font-headline font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    Salvar
                  </button>
                  <button
                    onClick={() => setIsEditingNote(false)}
                    className="flex-1 bg-surface-container-high text-on-surface-variant py-2 rounded-lg font-headline font-bold hover:text-on-surface transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-surface-container-lowest p-4 rounded-lg min-h-20 border border-outline-variant/10">
                <p className="font-body text-on-surface/80 text-sm whitespace-pre-wrap">
                  {note || <span className="text-on-surface-variant italic">Nenhuma nota</span>}
                </p>
              </div>
            )}
          </div>

          {/* Delete Button */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full border border-error/20 text-error py-3 px-4 rounded-lg font-headline font-bold hover:bg-error/10 transition-colors flex items-center justify-center gap-2"
            data-testid="delete-button"
          >
            <Trash2 size={18} />
            Deletar Bookmark
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Deletar Bookmark"
        message="Tem certeza que deseja deletar este bookmark? Esta ação não pode ser desfeita."
        confirmText="Deletar"
        cancelText="Cancelar"
        isDangerous={true}
        onConfirm={handleDeleteBookmark}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}
