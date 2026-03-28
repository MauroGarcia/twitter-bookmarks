import { useState, useEffect } from 'react'
import { X, Heart, Repeat2, ExternalLink, Save, Trash2 } from 'lucide-react'
import { TagBadge } from './TagBadge'
import { TagSelector } from './TagSelector'
import { useAppStore } from '../store/appStore'

export function TweetDetail({ bookmark, tags = [], onClose }) {
  const [note, setNote] = useState('')
  const [selectedTags, setSelectedTags] = useState(tags.map(t => t.id))
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [isEditingTags, setIsEditingTags] = useState(false)
  const { loadBookmarks } = useAppStore()

  useEffect(() => {
    if (bookmark) {
      loadNote()
    }
  }, [bookmark])

  const loadNote = async () => {
    try {
      const noteData = await window.api.getNote(bookmark.id)
      if (noteData) {
        setNote(noteData.content)
      }
    } catch (error) {
      console.error('Erro ao carregar nota:', error)
    }
  }

  const handleSaveNote = async () => {
    try {
      await window.api.upsertNote(bookmark.id, note)
      setIsEditingNote(false)
    } catch (error) {
      console.error('Erro ao salvar nota:', error)
    }
  }

  const handleSaveTags = async () => {
    try {
      await window.api.setBookmarkTags(bookmark.id, selectedTags)
      setIsEditingTags(false)
      await loadBookmarks()
    } catch (error) {
      console.error('Erro ao salvar tags:', error)
    }
  }

  const handleDeleteBookmark = async () => {
    if (window.confirm('Tem certeza que deseja deletar este bookmark?')) {
      try {
        await window.api.deleteBookmark(bookmark.id)
        await loadBookmarks()
        onClose()
      } catch (error) {
        console.error('Erro ao deletar bookmark:', error)
      }
    }
  }

  if (!bookmark) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Detalhes do Bookmark</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tweet Info */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex gap-3 mb-3">
              {bookmark.author_avatar_url && (
                <img
                  src={bookmark.author_avatar_url}
                  alt={bookmark.author_name}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{bookmark.author_name}</h3>
                <p className="text-sm text-gray-500">@{bookmark.author_handle}</p>
              </div>
            </div>
            <p className="text-gray-800 mb-3">{bookmark.full_text}</p>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <button className="flex items-center gap-1 hover:text-twitter">
                <Heart size={16} />
                {bookmark.like_count}
              </button>
              <button className="flex items-center gap-1 hover:text-twitter">
                <Repeat2 size={16} />
                {bookmark.retweet_count}
              </button>
              <a
                href={bookmark.tweet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-twitter ml-auto"
              >
                <ExternalLink size={16} />
                Ver no Twitter
              </a>
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">Tags</h4>
              {!isEditingTags && (
                <button
                  onClick={() => setIsEditingTags(true)}
                  className="text-sm text-twitter hover:underline"
                >
                  Editar
                </button>
              )}
            </div>

            {isEditingTags ? (
              <div className="space-y-2">
                <TagSelector selectedTagIds={selectedTags} onChange={setSelectedTags} />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveTags}
                    className="flex-1 bg-twitter text-white py-2 rounded-lg font-semibold hover:bg-blue-500"
                  >
                    <Save size={16} className="inline mr-2" />
                    Salvar
                  </button>
                  <button
                    onClick={() => setIsEditingTags(false)}
                    className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-300"
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
                {tags.length === 0 && <p className="text-gray-500 text-sm">Nenhuma tag</p>}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">Notas Pessoais</h4>
              {!isEditingNote && (
                <button
                  onClick={() => setIsEditingNote(true)}
                  className="text-sm text-twitter hover:underline"
                >
                  Editar
                </button>
              )}
            </div>

            {isEditingNote ? (
              <div className="space-y-2">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter"
                  placeholder="Adicione suas notas pessoais..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNote}
                    className="flex-1 bg-twitter text-white py-2 rounded-lg font-semibold hover:bg-blue-500"
                  >
                    <Save size={16} className="inline mr-2" />
                    Salvar
                  </button>
                  <button
                    onClick={() => setIsEditingNote(false)}
                    className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg min-h-20">
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {note || <span className="text-gray-400 italic">Nenhuma nota</span>}
                </p>
              </div>
            )}
          </div>

          {/* Delete Button */}
          <button
            onClick={handleDeleteBookmark}
            className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg font-semibold hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            Deletar Bookmark
          </button>
        </div>
      </div>
    </div>
  )
}
