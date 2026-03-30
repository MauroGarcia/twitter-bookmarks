import { useEffect, useState } from 'react'
import { Link, RefreshCcw, Unplug } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { api } from '../services/api'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'
import { Input } from './ui/Input'

export function ImportDialog() {
  const {
    importDialog,
    setImportDialog,
    loadAuthors,
    loadBookmarks,
    loadStats,
    setIsUsingMockData,
    resetBookmarksCache
  } = useAppStore()
  const [isConnectingX, setIsConnectingX] = useState(false)
  const [isSyncingX, setIsSyncingX] = useState(false)
  const [isDisconnectingX, setIsDisconnectingX] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [xStatus, setXStatus] = useState(null)
  const [xConfig, setXConfig] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: 'http://127.0.0.1:3000/callback'
  })

  const refreshData = async () => {
    setIsUsingMockData(false)
    resetBookmarksCache()
    await loadStats()
    await loadAuthors()
    await loadBookmarks()
  }

  const loadXStatus = async () => {
    const status = await api.getXAuthStatus()
    setXStatus(status)
    setXConfig((currentState) => ({
      clientId: status.config?.clientId || currentState.clientId,
      clientSecret: currentState.clientSecret,
      redirectUri: status.config?.redirectUri || currentState.redirectUri
    }))
  }

  useEffect(() => {
    if (importDialog) {
      loadXStatus().catch((currentError) => {
        setError(currentError.message)
      })
    }
  }, [importDialog])

  const handleConnectX = async () => {
    setMessage('')
    setError('')

    if (!xConfig.clientId.trim()) {
      setError('Preencha o Client ID antes de conectar.')
      return
    }

    if (!xConfig.redirectUri.trim()) {
      setError('Preencha o Redirect URI antes de conectar.')
      return
    }

    setIsConnectingX(true)
    setMessage('Preparando autenticação com a X API. Se o navegador não abrir, aguarde a mensagem de erro.')

    try {
      await api.connectXAccount(xConfig)
      await loadXStatus()
      setMessage('Conta X conectada com sucesso. Agora você já pode sincronizar seus bookmarks.')
    } catch (currentError) {
      setError(currentError.message)
    } finally {
      setIsConnectingX(false)
    }
  }

  const handleSyncX = async () => {
    setMessage('')
    setError('')
    setIsSyncingX(true)

    try {
      await api.saveXAuthConfig(xConfig)
      const result = await api.syncXBookmarks()
      await refreshData()
      await loadXStatus()
      setMessage(result.message)
    } catch (currentError) {
      setError(currentError.message)
    } finally {
      setIsSyncingX(false)
    }
  }

  const handleDisconnectX = async () => {
    setMessage('')
    setError('')
    setIsDisconnectingX(true)

    try {
      const status = await api.disconnectXAccount()
      setXStatus(status)
      setMessage('Conta X desconectada com sucesso.')
    } catch (currentError) {
      setError(currentError.message)
    } finally {
      setIsDisconnectingX(false)
    }
  }

  if (!importDialog) return null

  return (
    <Modal
      isOpen={importDialog}
      onClose={() => setImportDialog(false)}
      title="Conectar com X"
      size="lg"
      containerClassName="max-h-[85vh] overflow-hidden"
      bodyClassName="max-h-[calc(85vh-88px)] overflow-y-auto p-6"
    >
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

      <section className="rounded-layout border border-outline-variant/10 bg-surface-container-high p-4">
        <div className="mb-4">
          <h3 className="font-headline text-lg font-bold text-on-surface">Conectar com X API</h3>
          <p className="mt-2 text-sm text-on-surface-variant">
            Salve as credenciais da sua app, autentique via OAuth 2.0 e sincronize seus bookmarks reais.
          </p>
        </div>

        <div className="space-y-3">
          <Input
            value={xConfig.clientId}
            onChange={(event) => setXConfig((state) => ({ ...state, clientId: event.target.value }))}
            placeholder="Client ID"
          />
          <Input
            value={xConfig.clientSecret}
            onChange={(event) => setXConfig((state) => ({ ...state, clientSecret: event.target.value }))}
            placeholder="Client Secret"
            type="password"
          />
          <Input
            value={xConfig.redirectUri}
            onChange={(event) => setXConfig((state) => ({ ...state, redirectUri: event.target.value }))}
            placeholder="Redirect URI"
          />
        </div>

        <div className="mt-4 rounded-layout border border-outline-variant/10 bg-surface-container p-4 text-sm text-on-surface-variant">
          {xStatus?.connected
            ? (
                <>
                  <p className="font-semibold text-on-surface">
                    Conectado como @{xStatus.profile?.username || 'unknown'}
                  </p>
                  <p className="mt-1">
                    Último sync: {xStatus.lastSyncedAt ? new Date(xStatus.lastSyncedAt).toLocaleString('pt-BR') : 'ainda não executado'}
                  </p>
                </>
              )
            : (
                <p>Nenhuma conta X conectada ainda.</p>
              )}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <Button
            onClick={handleConnectX}
            disabled={isConnectingX || isSyncingX || isDisconnectingX}
            fullWidth
            icon={<Link size={18} />}
          >
            {isConnectingX ? 'Abrindo login da X...' : 'Conectar com X'}
          </Button>
          <Button
            onClick={handleSyncX}
            disabled={!xStatus?.connected || isConnectingX || isSyncingX || isDisconnectingX}
            variant="secondary"
            fullWidth
            icon={<RefreshCcw size={18} />}
          >
            {isSyncingX ? 'Sincronizando bookmarks...' : 'Sincronizar bookmarks'}
          </Button>
          <Button
            onClick={handleDisconnectX}
            disabled={!xStatus?.connected || isConnectingX || isSyncingX || isDisconnectingX}
            variant="ghost"
            fullWidth
            icon={<Unplug size={18} />}
          >
            {isDisconnectingX ? 'Desconectando...' : 'Desconectar conta X'}
          </Button>
        </div>
      </section>
    </Modal>
  )
}
