import { useEffect, useState } from 'react'
import { useAppStore } from '../store/appStore'

export function TagSelector({ selectedTagIds = [], onChange }) {
  const { tags } = useAppStore()
  const [newTagName, setNewTagName] = useState('')

  const handleToggleTag = (tagId) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId))
    } else {
      onChange([...selectedTagIds, tagId])
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    try {
      const result = await window.api.createTag(newTagName)
      onChange([...selectedTagIds, result.lastInsertRowid])
      setNewTagName('')
      // Reload tags
      const store = useAppStore.getState()
      await store.loadTags()
    } catch (error) {
      console.error('Erro ao criar tag:', error)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
          placeholder="Nova tag..."
          className="flex-1 px-3 py-2 bg-surface-container-lowest border border-outline-variant/20 rounded-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary/40 placeholder:text-on-surface-variant/40 text-sm"
        />
        <button
          onClick={handleCreateTag}
          className="bg-neon-gradient text-on-primary-fixed px-4 py-2 rounded-lg font-headline font-bold hover:opacity-90 active:scale-95 transition-all text-sm"
        >
          Criar
        </button>
      </div>

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {tags.map((tag) => (
          <label key={tag.id} className="flex items-center gap-3 p-2 hover:bg-surface-container-high rounded-lg cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={selectedTagIds.includes(tag.id)}
              onChange={() => handleToggleTag(tag.id)}
              className="w-4 h-4 rounded cursor-pointer accent-secondary"
            />
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: tag.color }}
            />
            <span className="flex-1 text-sm text-on-surface">{tag.name}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
