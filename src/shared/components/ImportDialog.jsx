import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { api } from '../services/api'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'

function isWebFilePickerAvailable() {
  return typeof window !== 'undefined' && typeof window.showOpenFilePicker === 'function'
}

async function readBookmarksFileFromHandle(handle) {
  const file = await handle.getFile()
  const content = await file.text()

  return {
    fileName: file.name,
    content
  }
}

export function ImportDialog() {
  const { importDialog, setImportDialog, loadBookmarks, loadStats } = useAppStore()
  const [isImporting, setIsImporting] = useState(false)
  const [isPickingFile, setIsPickingFile] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const hiddenFileInputRef = useRef(null)

  const pickFileWithFallback = async () => {
    if (isWebFilePickerAvailable()) {
      try {
        const [handle] = await window.showOpenFilePicker({
          multiple: false,
          types: [
            {
              description: 'Twitter bookmarks export',
              accept: {
                'text/javascript': ['.js'],
                'application/javascript': ['.js'],
                'text/plain': ['.js']
              }
            }
          ]
        })

        if (!handle) {
          return null
        }

        return readBookmarksFileFromHandle(handle)
      } catch (error) {
        if (error?.name === 'AbortError') {
          return null
        }

        throw error
      }
    }

    return new Promise((resolve, reject) => {
      const input = hiddenFileInputRef.current
      if (!input) {
        reject(new Error('Seletor de arquivo indisponível'))
        return null
      }

      let settled = false
      let focusTimeoutId = null

      const cleanup = () => {
        input.onchange = null
        window.removeEventListener('focus', handleWindowFocus)

        if (focusTimeoutId !== null) {
          window.clearTimeout(focusTimeoutId)
          focusTimeoutId = null
        }
      }

      const finish = (value) => {
        if (settled) return
        settled = true
        cleanup()
        resolve(value)
      }

      const handleWindowFocus = () => {
        focusTimeoutId = window.setTimeout(() => {
          if (!input.files?.length) {
            finish(null)
          }
        }, 0)
      }

      input.value = ''
      input.onchange = async (event) => {
        const file = event.target.files?.[0]
        if (!file) {
          finish(null)
          return
        }

        finish({
          fileName: file.name,
          content: await file.text()
        })
      }

      window.addEventListener('focus', handleWindowFocus, { once: true })
      input.click()
    })
  }

  const handleImport = async () => {
    setMessage('')
    setError('')

    try {
      const isElectronImport = typeof window !== 'undefined' && Boolean(window.api)
      if (!isElectronImport) {
        setIsPickingFile(true)
      }

      const maybeFilePayload = isElectronImport
        ? undefined
        : await pickFileWithFallback()

      if (maybeFilePayload === null) {
        return
      }

      setIsImporting(true)
      const result = await api.importBookmarks(maybeFilePayload)

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
      setIsPickingFile(false)
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
      <input
        ref={hiddenFileInputRef}
        type="file"
        accept=".js"
        className="hidden"
      />

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
        disabled={isImporting || isPickingFile}
        fullWidth
        icon={<Upload size={18} />}
      >
        {isImporting ? 'Importando...' : isPickingFile ? 'Selecionando arquivo...' : 'Selecionar e Importar'}
      </Button>
    </Modal>
  )
}
