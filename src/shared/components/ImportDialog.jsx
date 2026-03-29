import { useState } from 'react'
import { Upload } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { api } from '../services/api'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'

export function ImportDialog() {
  const { importDialog, setImportDialog, loadBookmarks, loadStats } = useAppStore()
  const [isImporting, setIsImporting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleImport = async () => {
    setIsImporting(true)
    setMessage('')
    setError('')

    try {
      const result = await api.importBookmarks()

      if (result.success) {
        setMessage(result.message)
        await loadBookmarks()
        await loadStats()

        setTimeout(() => {
          setImportDialog(false)
        }, 1500)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsImporting(false)
    }
  }

  if (!importDialog) return null

  return (
    <Modal
      isOpen={importDialog}
      onClose={() => setImportDialog(false)}
      title="Importar Bookmarks"
      bodyClassName="p-6"
    >
        <p className="font-body text-sm text-on-surface-variant mb-6">
          Selecione o arquivo <code className="bg-surface-container-highest px-2 py-1 rounded text-on-surface">bookmarks.js</code> da sua
          exportação do Twitter para importar todos os seus bookmarks salvos.
        </p>

        {message && (
          <div className="mb-4 p-3 bg-secondary/10 text-secondary rounded-lg text-sm border border-secondary/20">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-error/10 text-error rounded-lg text-sm border border-error/20">
            ✕ {error}
          </div>
        )}

        <Button
          onClick={handleImport}
          disabled={isImporting}
          fullWidth
          icon={<Upload size={18} />}
        >
          {isImporting ? 'Importando...' : 'Selecionar e Importar'}
        </Button>
    </Modal>
  )
}
