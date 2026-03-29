import { X } from 'lucide-react'

export function ConfirmDialog({
  isOpen,
  title = 'Confirmar',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  isDangerous = false
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface-container rounded-xl p-6 max-w-sm w-full mx-4 shadow-cyan border border-outline-variant/10">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-outline-variant/10">
          <h2 className="font-headline text-lg font-bold text-on-surface">{title}</h2>
          <button
            onClick={onCancel}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Fechar"
            data-testid="confirm-close"
          >
            <X size={20} />
          </button>
        </div>

        <p className="font-body text-on-surface-variant mb-6 text-sm">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-surface-container-high text-on-surface-variant py-3 px-4 rounded-lg font-headline font-bold hover:text-on-surface transition-colors"
            data-testid="confirm-cancel"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 rounded-lg font-headline font-bold transition-colors ${
              isDangerous
                ? 'border border-error/20 text-error hover:bg-error/10'
                : 'bg-neon-gradient text-on-primary-fixed hover:opacity-90'
            }`}
            data-testid="confirm-confirm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
