import { useState } from 'react'
import { X, Upload } from 'lucide-react'
import { useAppStore } from '../store/appStore'

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
      const result = await window.api.importBookmarks()

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Importar Bookmarks</h2>
          <button
            onClick={() => setImportDialog(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Selecione o arquivo <code className="bg-gray-100 px-2 py-1 rounded">bookmarks.js</code> da sua
          exportação do Twitter para importar todos os seus bookmarks salvos.
        </p>

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={isImporting}
          className="w-full bg-twitter text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Upload size={18} />
          {isImporting ? 'Importando...' : 'Selecionar e Importar'}
        </button>
      </div>
    </div>
  )
}
