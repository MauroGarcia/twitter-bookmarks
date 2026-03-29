import { useState } from 'react'
import { X, Upload } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { api } from '../services/api'

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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface-container rounded-xl p-6 shadow-cyan border border-outline-variant/10 max-w-lg w-full mx-4">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-outline-variant/10">
          <h2 className="font-headline text-lg font-bold text-on-surface">Importar Bookmarks</h2>
          <button
            onClick={() => setImportDialog(false)}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <X size={20} />
          </button>
        </div>

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

        <button
          onClick={handleImport}
          disabled={isImporting}
          className="w-full bg-neon-gradient text-on-primary-fixed py-3 px-4 rounded-lg font-headline font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Upload size={18} />
          {isImporting ? 'Importando...' : 'Selecionar e Importar'}
        </button>
      </div>
    </div>
  )
}
