import clsx from 'clsx'
import { X } from 'lucide-react'

export function TagBadge({ tag, removable = false, onRemove }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium',
        'text-white'
      )}
      style={{ backgroundColor: tag.color }}
    >
      {tag.name}
      {removable && (
        <button
          onClick={onRemove}
          className="hover:opacity-75 transition-opacity"
          aria-label="Remover tag"
        >
          <X size={14} />
        </button>
      )}
    </span>
  )
}
