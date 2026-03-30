import { app, BrowserWindow, Menu, shell } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDb } from './db.js'
import { registerIpcHandlers } from './ipc-handlers.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow

function createWindow() {
  const preloadPath = path.join(__dirname, '../preload/index.mjs')
  console.log('[main] creating window with preload:', preloadPath)

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    show: false,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  })

  const isDev = !app.isPackaged

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../out/renderer/index.html'))
  }

  mainWindow.maximize()
  mainWindow.show()

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const currentUrl = mainWindow.webContents.getURL()

    if (url !== currentUrl) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })

  mainWindow.webContents.on('did-finish-load', async () => {
    try {
      const hasApi = await mainWindow.webContents.executeJavaScript('typeof window.api')
      console.log('[main] renderer window.api type:', hasApi)
    } catch (error) {
      console.error('[main] failed to inspect window.api:', error)
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createMenu() {
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Sair',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { label: 'Desfazer', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Refazer', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
        { type: 'separator' },
        { label: 'Cortar', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copiar', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Colar', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'Visualizar',
      submenu: [
        { role: 'reload', label: 'Recarregar' },
        { role: 'forceReload', label: 'Forçar Recarga' },
        { role: 'toggleDevTools', label: 'Ferramentas de Desenvolvedor' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

app.on('ready', () => {
  initDb()
  registerIpcHandlers()
  createWindow()
  createMenu()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

export default app
