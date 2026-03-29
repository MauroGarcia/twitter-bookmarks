import clsx from 'clsx'
import { X } from 'lucide-react'
import { IconButton } from './IconButton'

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  bodyClassName,
  containerClassName,
  closeButtonProps,
  showHeader = true,
  children
}) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className={clsx('modal-container', sizes[size] ?? sizes.md, containerClassName)}>
        {showHeader && (
          <div className="modal-header">
            <h2 className="font-headline text-lg font-bold text-on-surface">{title}</h2>
            <IconButton
              onClick={onClose}
              aria-label="Fechar"
              icon={<X size={20} />}
              {...closeButtonProps}
            />
          </div>
        )}
        <div className={clsx(bodyClassName)}>{children}</div>
      </div>
    </div>
  )
}
