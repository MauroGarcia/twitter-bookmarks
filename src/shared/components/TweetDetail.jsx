import { useEffect, useState } from 'react'
import { Archive, ExternalLink, Save, Star, Trash2 } from 'lucide-react'
import { TagBadge } from './TagBadge'
import { TagSelector } from './TagSelector'
import { ConfirmDialog } from './ConfirmDialog'
import { ArticlePreview, TweetText } from './BookmarkCard'
import { useAppStore } from '../store/appStore'
import { api } from '../services/api'
import { Avatar } from './ui/Avatar'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'

export function TweetDetail({ bookmark, tags = [], onClose }) {
  const [note, setNote] = useState('')
  const [selectedTags, setSelectedTags] = useState(tags.map((tag) => tag.id))
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [isEditingTags, setIsEditingTags] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [isFavoritingBurstVisible, setIsFavoritingBurstVisible] = useState(false)
  const loadBookmarks = useAppStore((state) => state.loadBookmarks)
  const toggleBookmarkFavorite = useAppStore((state) => state.toggleBookmarkFavorite)
  const toggleBookmarkArchived = useAppStore((state) => state.toggleBookmarkArchived)

  useEffect(() => {
    if (!isFavoritingBurstVisible) return undefined

    const timeoutId = window.setTimeout(() => {
      setIsFavoritingBurstVisible(false)
    }, 180)

    return () => window.clearTimeout(timeoutId)
  }, [isFavoritingBurstVisible])

  useEffect(() => {
    if (!bookmark) return

    setSelectedTags(tags.map((tag) => tag.id))

    const loadNote = async () => {
      try {
        const noteData = await api.getNote(bookmark.id)
        setNote(noteData?.content ?? '')
      } catch (error) {
        console.error('Erro ao carregar nota:', error)
      }
    }

    loadNote()
  }, [bookmark, tags])

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
    <>
      <Modal
        isOpen={Boolean(bookmark)}
        onClose={onClose}
        title="Detalhes do Bookmark"
        size="xl"
        containerClassName="max-h-[88vh]"
        bodyClassName="space-y-6 overflow-y-auto p-6"
      >
        <div className="border-b border-outline-variant/10 pb-4">
          <div className="mb-3 flex gap-3">
            <Avatar
              src={bookmark.author_avatar_url}
              name={bookmark.author_name}
              size="lg"
              className="ring-1 ring-primary/20"
            />
            <div className="flex-1">
              <h3 className="font-headline font-bold text-on-surface">{bookmark.author_name}</h3>
              <p className="text-sm text-on-surface-variant">@{bookmark.author_handle}</p>
            </div>
            <button
              onClick={() => {
                if (!bookmark.is_favorite) {
                  setIsFavoritingBurstVisible(true)
                }
                toggleBookmarkFavorite(bookmark.id)
              }}
              className={`relative flex h-10 w-10 cursor-pointer items-center justify-center transition-all duration-150 ${
                bookmark.is_favorite
                  ? 'text-[#ffb347] drop-shadow-[0_0_12px_rgba(255,179,71,0.35)]'
                  : 'text-on-surface-variant hover:text-[#ffb347]'
              }`}
              title={bookmark.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Star
                size={20}
                className={`transition-all duration-150 ${
                  bookmark.is_favorite ? 'fill-current scale-110' : ''
                } ${isFavoritingBurstVisible ? 'scale-[1.38]' : 'scale-100'}`}
              />
            </button>
          </div>

          <TweetText text={bookmark.full_text} className="mb-3 font-body text-on-surface/80" />

          {bookmark.article_data?.media_urls?.[0] && (
            <button
              type="button"
              onClick={() => setSelectedImage(bookmark.article_data.media_urls[0])}
              className="mb-4 block w-full overflow-hidden rounded-lg border border-outline-variant/10"
            >
              <img
                src={bookmark.article_data.media_urls[0]}
                alt={bookmark.article_data.title || bookmark.author_name}
                className="w-full object-contain bg-black/20"
              />
            </button>
          )}

          {bookmark.article_data && (
            <div className="mb-3">
              <ArticlePreview article={bookmark.article_data} onImageClick={setSelectedImage} />
            </div>
          )}

          {!bookmark.article_data && bookmark.mediaUrls?.length > 0 && (
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
              <TweetText
                text={bookmark.quoted_tweet.full_text}
                className="text-xs leading-relaxed text-on-surface-variant"
              />
            </div>
          )}

          <div className="flex items-center gap-3 text-sm text-on-surface-variant">
            <button
              onClick={() => toggleBookmarkArchived(bookmark.id)}
              className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 transition-colors ${
                bookmark.is_archived
                  ? 'border-secondary/30 bg-secondary/10 text-secondary'
                  : 'border-outline-variant/20 hover:text-secondary'
              }`}
            >
              <Archive size={16} />
              {bookmark.is_archived ? 'Arquivado' : 'Arquivar'}
            </button>
            <a
              href={bookmark.tweet_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 transition-colors hover:text-primary"
            >
              <ExternalLink size={16} />
              Ver no Twitter
            </a>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-headline font-semibold text-on-surface">Tags</h4>
            {!isEditingTags && (
              <button
                onClick={() => setIsEditingTags(true)}
                className="text-sm text-secondary transition-colors hover:text-primary"
              >
                Editar
              </button>
            )}
          </div>

          {isEditingTags ? (
            <div className="space-y-3">
              <TagSelector selectedTagIds={selectedTags} onChange={setSelectedTags} />
              <div className="flex gap-2">
                <Button onClick={handleSaveTags} fullWidth size="sm" icon={<Save size={16} />}>
                  Salvar
                </Button>
                <Button onClick={() => setIsEditingTags(false)} variant="secondary" fullWidth size="sm">
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
              {tags.length === 0 && <p className="text-sm text-on-surface-variant">Nenhuma tag</p>}
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-headline font-semibold text-on-surface">Notas Pessoais</h4>
            {!isEditingNote && (
              <button
                onClick={() => setIsEditingNote(true)}
                className="text-sm text-secondary transition-colors hover:text-primary"
              >
                Editar
              </button>
            )}
          </div>

          {isEditingNote ? (
            <div className="space-y-3">
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="input-base h-32 p-3"
                placeholder="Adicione suas notas pessoais..."
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveNote} fullWidth size="sm" icon={<Save size={16} />}>
                  Salvar
                </Button>
                <Button onClick={() => setIsEditingNote(false)} variant="secondary" fullWidth size="sm">
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="min-h-20 rounded-lg border border-outline-variant/10 bg-surface-container-lowest p-4">
              <p className="whitespace-pre-wrap text-sm font-body text-on-surface/80">
                {note || <span className="italic text-on-surface-variant">Nenhuma nota</span>}
              </p>
            </div>
          )}
        </div>

        <Button
          onClick={() => setShowDeleteConfirm(true)}
          variant="danger"
          fullWidth
          icon={<Trash2 size={18} />}
          data-testid="delete-button"
        >
          Deletar Bookmark
        </Button>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Deletar Bookmark"
        message="Tem certeza que deseja deletar este bookmark? Esta ação não pode ser desfeita."
        confirmText="Deletar"
        cancelText="Cancelar"
        isDangerous
        onConfirm={handleDeleteBookmark}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-6"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Visualização ampliada"
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        </div>
      )}
    </>
  )
}
