import { Button } from './ui/Button'
import { Modal } from './ui/Modal'

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
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      bodyClassName="p-6"
      closeButtonProps={{ 'data-testid': 'confirm-close' }}
    >
      <p className="mb-6 font-body text-sm text-on-surface-variant">{message}</p>

      <div className="flex gap-3">
        <Button onClick={onCancel} variant="secondary" fullWidth data-testid="confirm-cancel">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} variant={isDangerous ? 'danger' : 'primary'} fullWidth data-testid="confirm-confirm">
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}
