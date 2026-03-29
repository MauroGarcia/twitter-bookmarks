import clsx from 'clsx'
import { X } from 'lucide-react'
import { Badge } from './ui/Badge'

export function TagBadge({ tag, removable = false, onRemove }) {
  return (
    <Badge
      className={clsx('text-sm font-medium text-white', removable && 'pr-2')}
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
    </Badge>
  )
}
