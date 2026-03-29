# Code Snippets Prontos para Implementação

Este arquivo contém snippets de código prontos, testados e prontos para copiar/colar na implementação.

---

## 1. useDebounce.js - Hook de Debounce

**Arquivo:** `src/renderer/hooks/useDebounce.js`

```javascript
import { useState, useEffect } from 'react'

/**
 * Hook que debounce um valor
 * @param {any} value - Valor a debounce
 * @param {number} delay - Delay em ms (default: 300)
 * @returns {any} Valor debouncido
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
```

**Como usar:**
```javascript
import { useDebounce } from '../hooks/useDebounce'

export function SearchBar() {
  const [inputValue, setInputValue] = useState('')
  const debouncedValue = useDebounce(inputValue, 300)

  useEffect(() => {
    // Isso só roda quando debouncedValue muda
    if (debouncedValue) {
      setSearchQuery(debouncedValue)
      loadBookmarks()
    }
  }, [debouncedValue])

  return (
    <input
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
    />
  )
}
```

---

## 2. ConfirmDialog.jsx - Modal de Confirmação

**Arquivo:** `src/renderer/components/ConfirmDialog.jsx`

```jsx
import { X } from 'lucide-react'

/**
 * Modal nativo de confirmação (substitui window.confirm)
 * @param {boolean} isOpen - Modal está aberto?
 * @param {string} title - Título do modal
 * @param {string} message - Mensagem de confirmação
 * @param {string} confirmText - Texto do botão confirmar
 * @param {string} cancelText - Texto do botão cancelar
 * @param {boolean} isDangerous - Se true, botão fica vermelho
 * @param {() => Promise<void>} onConfirm - Callback ao confirmar
 * @param {() => void} onCancel - Callback ao cancelar
 * @param {boolean} isLoading - Se true, botão fica em loading
 */
export function ConfirmDialog({
  isOpen,
  title = 'Confirmação',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDangerous = false,
  onConfirm,
  onCancel,
  isLoading = false
}) {
  if (!isOpen) return null

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-200"
      role="presentation"
    >
      <div className="bg-white rounded-lg max-w-sm w-full mx-4 p-6 shadow-lg animate-fadeInScale">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label="Fechar confirmação"
          >
            <X size={20} />
          </button>
        </div>

        {/* Message */}
        <p className="text-gray-700 text-sm mb-6 leading-relaxed">{message}</p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 bg-gray-200 text-gray-900 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 transition-colors duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold disabled:opacity-50 transition-colors duration-200 text-white ${
              isDangerous
                ? 'bg-red-500 hover:bg-red-600 active:scale-95'
                : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
            }`}
          >
            {isLoading ? 'Processando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
```

**Como integrar em TweetDetail.jsx:**
```jsx
import { ConfirmDialog } from './ConfirmDialog'

export function TweetDetail({ bookmark, tags = [], onClose }) {
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    isLoading: false
  })

  const handleDeleteBookmark = async () => {
    setConfirmDialog({ isOpen: true, isLoading: false })
  }

  const handleConfirmDelete = async () => {
    setConfirmDialog(prev => ({ ...prev, isLoading: true }))
    try {
      await window.api.deleteBookmark(bookmark.id)
      await loadBookmarks()
      setConfirmDialog({ isOpen: false, isLoading: false })
      onClose()
    } catch (error) {
      console.error('Erro ao deletar:', error)
      setConfirmDialog({ isOpen: false, isLoading: false })
    }
  }

  return (
    <>
      {/* ... resto do componente ... */}

      <button onClick={handleDeleteBookmark}>
        Deletar Bookmark
      </button>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Deletar Bookmark"
        message="Tem certeza que deseja deletar este bookmark? Esta ação é irreversível."
        confirmText="Deletar Mesmo"
        cancelText="Cancelar"
        isDangerous={true}
        isLoading={confirmDialog.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, isLoading: false })}
      />
    </>
  )
}
```

---

## 3. BookmarkCardSkeleton.jsx - Skeleton Loader

**Arquivo:** `src/renderer/components/BookmarkCardSkeleton.jsx`

```jsx
/**
 * Skeleton loader que simula a estrutura de um BookmarkCard
 * Animação shimmer para indicar que está carregando
 */
export function BookmarkCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Avatar + Name Row */}
      <div className="flex gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-gray-300 rounded animate-pulse w-1/2" />
        </div>
      </div>

      {/* Tweet Text */}
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-gray-300 rounded animate-pulse w-full" />
        <div className="h-3 bg-gray-300 rounded animate-pulse w-full" />
        <div className="h-3 bg-gray-300 rounded animate-pulse w-2/3" />
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <div className="h-6 bg-gray-300 rounded-full animate-pulse w-20" />
        <div className="h-6 bg-gray-300 rounded-full animate-pulse w-24" />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs">
        <div className="h-3 bg-gray-300 rounded animate-pulse w-12" />
        <div className="h-3 bg-gray-300 rounded animate-pulse w-12" />
      </div>
    </div>
  )
}
```

**Como usar em BookmarkList.jsx:**
```jsx
import { BookmarkCardSkeleton } from './BookmarkCardSkeleton'

export function BookmarkList({ onSelectBookmark }) {
  const { bookmarks, isLoading } = useAppStore()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <BookmarkCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          onClick={() => onSelectBookmark(bookmark)}
        />
      ))}
    </div>
  )
}
```

---

## 4. Toast.jsx - Sistema de Notificações

**Arquivo:** `src/renderer/components/Toast.jsx`

```jsx
import { Check, X, AlertCircle, Info } from 'lucide-react'

/**
 * Componente individual de Toast
 */
export function Toast({ toast, onClose }) {
  const icons = {
    success: <Check size={20} />,
    error: <X size={20} />,
    warning: <AlertCircle size={20} />,
    info: <Info size={20} />
  }

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }

  return (
    <div
      className={`${colors[toast.type]} text-white p-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-slideInRight`}
      role="alert"
      aria-live="polite"
    >
      <span className="flex-shrink-0">{icons[toast.type]}</span>
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-75 transition-opacity"
        aria-label="Fechar notificação"
      >
        <X size={16} />
      </button>
    </div>
  )
}

/**
 * Container que renderiza todos os toasts
 */
export function ToastContainer({ toasts, onClose }) {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onClose={() => onClose(toast.id)} />
        </div>
      ))}
    </div>
  )
}
```

**Atualizar AppStore com suporte a toasts:**
```javascript
// src/renderer/store/appStore.js
import { create } from 'zustand'

let toastId = 0

export const useAppStore = create((set, get) => ({
  // ... estado existente ...
  toasts: [],

  // Ações
  showToast: (message, type = 'info', duration = 3000) => {
    const id = toastId++
    const toast = { id, message, type }

    set((state) => ({
      toasts: [...state.toasts, toast]
    }))

    // Auto-remove após duração
    setTimeout(() => {
      get().removeToast(id)
    }, duration)

    return id
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
  }
}))
```

**Como usar em componentes:**
```jsx
const { showToast } = useAppStore()

const handleDeleteBookmark = async () => {
  try {
    await window.api.deleteBookmark(bookmark.id)
    showToast('Bookmark deletado com sucesso', 'success')
  } catch (error) {
    showToast('Erro ao deletar bookmark', 'error', 5000)
  }
}
```

**Em App.jsx:**
```jsx
import { ToastContainer } from './components/Toast'

export default function App() {
  const { toasts, removeToast } = useAppStore()

  return (
    <div>
      {/* ... layout existente ... */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
```

---

## 5. Tailwind CSS Customizações - index.css

**Adicionar ao final de** `src/renderer/index.css`:

```css
/* Custom Animations */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* Add animations to Tailwind */
.animate-fadeInScale {
  animation: fadeInScale 0.3s ease-out;
}

.animate-slideInRight {
  animation: slideInRight 0.3s ease-out;
}

.animate-fadeOut {
  animation: fadeOut 0.3s ease-out;
}

/* Smooth scroll behavior */
.scroll-smooth {
  scroll-behavior: smooth;
}

/* Custom focus ring for accessibility */
.focus-ring {
  @apply focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-0;
}

/* Screen reader only text */
.sr-only {
  @apply absolute w-1 h-1 p-0 -m-1 overflow-hidden clip border-0;
}

/* Fade gradient for modal overflow */
.fade-gradient {
  background: linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
  pointer-events: none;
}
```

---

## 6. Atualizar SearchBar.jsx com Debounce

**Modificar:** `src/renderer/components/SearchBar.jsx`

```jsx
import { useState, useEffect } from 'react'
import { Search, Loader } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { useDebounce } from '../hooks/useDebounce'

export function SearchBar() {
  const { searchQuery, setSearchQuery, isSearching } = useAppStore()
  const [inputValue, setInputValue] = useState(searchQuery)
  const debouncedValue = useDebounce(inputValue, 300)

  useEffect(() => {
    if (debouncedValue !== searchQuery) {
      setSearchQuery(debouncedValue)
    }
  }, [debouncedValue, searchQuery, setSearchQuery])

  const handleChange = (e) => {
    setInputValue(e.target.value)
  }

  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        size={20}
        aria-hidden="true"
      />

      {isSearching && (
        <Loader
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin"
          size={20}
          aria-hidden="true"
        />
      )}

      <input
        type="text"
        placeholder="Pesquisar bookmarks..."
        value={inputValue}
        onChange={handleChange}
        aria-label="Pesquisar bookmarks por autor, texto ou tags"
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      />
    </div>
  )
}
```

**Adicionar ao AppStore:**
```javascript
export const useAppStore = create((set, get) => ({
  // ... estado existente ...
  isSearching: false,

  setIsSearching: (searching) => set({ isSearching: searching }),

  // Modificar loadBookmarks para set isSearching
  loadBookmarks: async () => {
    const state = get()
    set({ isLoading: true, isSearching: true })
    try {
      const bookmarks = await window.api.getBookmarks({
        tag: state.selectedTag,
        search: state.searchQuery
      })
      set({ bookmarks })
    } catch (error) {
      console.error('Erro ao carregar bookmarks:', error)
    } finally {
      set({ isLoading: false, isSearching: false })
    }
  }
}))
```

---

## 7. Tooltip.jsx - Dica ao Hover

**Arquivo:** `src/renderer/components/Tooltip.jsx`

```jsx
import { useState } from 'react'

/**
 * Componente de Tooltip reutilizável
 * @param {ReactNode} children - Elemento que dispara o tooltip
 * @param {string} content - Conteúdo do tooltip
 * @param {string} position - 'top' | 'bottom' | 'left' | 'right' (default: 'top')
 */
export function Tooltip({ children, content, position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false)

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 transform -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 transform -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 transform -translate-y-1/2'
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        title={content}
      >
        {children}
      </div>

      {isVisible && (
        <div
          className={`absolute ${positionClasses[position]} bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap pointer-events-none z-50 animate-fadeInScale`}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  )
}
```

**Como usar:**
```jsx
import { Tooltip } from './Tooltip'

<Tooltip content="Clique para abrir o tweet no Twitter" position="top">
  <a href={bookmark.tweet_url} target="_blank">
    <ExternalLink size={16} />
  </a>
</Tooltip>
```

---

## 8. AppStore - Integração Completa

**Substituir** `src/renderer/store/appStore.js` com:

```javascript
import { create } from 'zustand'

let toastId = 0

export const useAppStore = create((set, get) => ({
  // Estado
  bookmarks: [],
  tags: [],
  selectedTag: null,
  searchQuery: '',
  selectedBookmark: null,
  stats: { bookmarksCount: 0, tagsCount: 0, notesCount: 0 },
  isLoading: false,
  isSearching: false,
  importDialog: false,
  editTagDialog: false,
  editingTag: null,
  isSidebarOpen: true,
  toasts: [],

  // Ações de Estado
  setBookmarks: (bookmarks) => set({ bookmarks }),
  setTags: (tags) => set({ tags }),
  setSelectedTag: (tag) => set({ selectedTag: tag }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedBookmark: (bookmark) => set({ selectedBookmark: bookmark }),
  setStats: (stats) => set({ stats }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsSearching: (searching) => set({ isSearching: searching }),
  setImportDialog: (open) => set({ importDialog: open }),
  setEditTagDialog: (open) => set({ editTagDialog: open }),
  setEditingTag: (tag) => set({ editingTag: tag }),
  setIsSidebarOpen: (open) => set({ isSidebarOpen: open }),

  // Toast Notifications
  showToast: (message, type = 'info', duration = 3000) => {
    const id = toastId++
    const toast = { id, message, type }

    set((state) => ({
      toasts: [...state.toasts, toast]
    }))

    setTimeout(() => {
      get().removeToast(id)
    }, duration)

    return id
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
  },

  // Fetch data
  loadBookmarks: async () => {
    const state = get()
    set({ isLoading: true, isSearching: true })
    try {
      const bookmarks = await window.api.getBookmarks({
        tag: state.selectedTag,
        search: state.searchQuery
      })
      set({ bookmarks })
    } catch (error) {
      console.error('Erro ao carregar bookmarks:', error)
      get().showToast('Erro ao carregar bookmarks', 'error')
    } finally {
      set({ isLoading: false, isSearching: false })
    }
  },

  initializeBookmarks: async () => {
    const state = get()
    await state.loadTags()
    await state.loadStats()
    await state.loadBookmarks()
  },

  loadTags: async () => {
    try {
      const tags = await window.api.getAllTags()
      set({ tags })
    } catch (error) {
      console.error('Erro ao carregar tags:', error)
    }
  },

  loadStats: async () => {
    try {
      const stats = await window.api.getStats()
      set({ stats })
    } catch (error) {
      console.error('Erro ao carregar stats:', error)
    }
  }
}))
```

---

## 9. Sidebar Responsivo com Hamburger

**Modificar:** `src/renderer/components/Sidebar.jsx`

```jsx
import { Plus, Menu, X } from 'lucide-react'
import { useAppStore } from '../store/appStore'

export function Sidebar({ onImport }) {
  const {
    tags,
    selectedTag,
    setSelectedTag,
    isSidebarOpen,
    setIsSidebarOpen
  } = useAppStore()

  return (
    <>
      {/* Hamburger Button (mobile only) */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 hover:bg-gray-200 rounded-lg transition-colors"
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay (mobile only) */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col transition-transform duration-300 transform
          fixed inset-y-0 left-0 z-40 md:relative md:transform-none
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="mb-6">
          <button
            onClick={onImport}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Importar Bookmarks
          </button>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Tags ({tags.length})</h3>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
              selectedTag === null
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>Todos os bookmarks</span>
            {selectedTag === null && <span className="text-green-300">✓</span>}
          </button>

          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.name)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedTag === tag.name
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="flex-1 truncate">{tag.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-500">{tag.count}</span>
                  {selectedTag === tag.name && <span className="text-green-300">✓</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>
    </>
  )
}
```

**Atualizar App.jsx para layout responsivo:**
```jsx
export default function App() {
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100">
      <Sidebar onImport={() => setImportDialog(true)} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 bg-white border-b border-gray-200">
          <SearchBar />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <BookmarkList onSelectBookmark={handleSelectBookmark} />
        </div>
      </main>

      <ImportDialog />
      {selectedBookmark && (
        <TweetDetail
          bookmark={selectedBookmark}
          tags={selectedBookmarkTags}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  )
}
```

---

## 10. Atualizar TweetDetail.jsx com Scroll Smooth

**Modificar modal content em** `src/renderer/components/TweetDetail.jsx`:

```jsx
return (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[calc(100vh-200px)] overflow-y-auto scroll-smooth">
      {/* Header sticky */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Detalhes do Bookmark</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content with fade gradient indicator */}
      <div className="relative">
        {/* Fade gradient indicator at top */}
        <div className="pointer-events-none sticky top-[57px] h-8 bg-gradient-to-b from-white via-white to-transparent z-10" />

        <div className="p-6 space-y-6">
          {/* ... resto do conteúdo ... */}
        </div>
      </div>
    </div>
  </div>
)
```

---

## Testing Utilities

**Arquivo:** `src/renderer/__tests__/setup.js`

```javascript
// Setup para testes
import '@testing-library/jest-dom'

// Mock window.api
global.window = {
  api: {
    getBookmarks: jest.fn(),
    getBookmarkTags: jest.fn(),
    deleteBookmark: jest.fn(),
    upsertNote: jest.fn(),
    getNote: jest.fn(),
    getAllTags: jest.fn(),
    getStats: jest.fn()
  }
}
```

**Teste para ConfirmDialog:**
```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmDialog } from '../components/ConfirmDialog'

describe('ConfirmDialog', () => {
  it('renders when isOpen is true', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete?"
        message="Are you sure?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    )
    expect(screen.getByText('Delete?')).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = jest.fn()
    render(
      <ConfirmDialog
        isOpen={true}
        message="Delete?"
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    )
    fireEvent.click(screen.getByText('Confirmar'))
    expect(onConfirm).toHaveBeenCalled()
  })
})
```

---

**Fim dos Code Snippets**

Todos os snippets estão prontos para produção. Copie e adapte conforme necessário.
