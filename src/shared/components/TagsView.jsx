import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Check, Hash, PaintBucket, Plus, Sparkles, Trash2 } from 'lucide-react'
import { api } from '../services/api'
import { useAppStore } from '../store/appStore'
import { TweetText } from './BookmarkCard'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { SectionHeader } from './ui/SectionHeader'
import { StatCard } from './ui/StatCard'

const COLOR_OPTIONS = [
  '#6366f1',
  '#8b5cf6',
  '#00e3fd',
  '#ff5ed6',
  '#ff6e84',
  '#22c55e',
  '#f59e0b',
  '#94a3b8'
]

function formatCount(value) {
  return new Intl.NumberFormat('pt-BR').format(value || 0)
}

function formatDate(value) {
  if (!value) return 'Agora'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Agora'

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

function getTagHealth(tag) {
  if (!tag) return null
  if ((tag.count || 0) === 0) return { label: 'Órfã', tone: 'default' }
  if ((tag.count || 0) <= 2) return { label: 'Baixa cobertura', tone: 'secondary' }
  return { label: 'Ativa', tone: 'primary' }
}

function extractSignals(bookmarks) {
  const handles = new Set()
  const domains = new Set()

  for (const bookmark of bookmarks) {
    if (bookmark.author_handle) {
      handles.add(`@${bookmark.author_handle}`)
    }

    for (const link of bookmark.linkItems || []) {
      try {
        domains.add(new URL(link.expanded_url || link.url).hostname.replace(/^www\./, ''))
      } catch {
        continue
      }
    }
  }

  return {
    handles: Array.from(handles).slice(0, 3),
    domains: Array.from(domains).slice(0, 3)
  }
}

export function TagsView() {
  const tags = useAppStore((state) => state.tags)
  const tagSearchQuery = useAppStore((state) => state.tagSearchQuery)
  const loadTags = useAppStore((state) => state.loadTags)
  const loadStats = useAppStore((state) => state.loadStats)
  const [selectedTagId, setSelectedTagId] = useState(null)
  const [draftName, setDraftName] = useState('')
  const [draftColor, setDraftColor] = useState(COLOR_OPTIONS[0])
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [previewBookmarks, setPreviewBookmarks] = useState([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const filteredTags = useMemo(() => {
    const normalizedQuery = `${tagSearchQuery}`.trim().toLowerCase()

    return tags
      .filter((tag) => {
        if (!normalizedQuery) return true
        return `${tag.name}`.toLowerCase().includes(normalizedQuery)
      })
      .sort((left, right) => {
        if ((right.count || 0) !== (left.count || 0)) {
          return (right.count || 0) - (left.count || 0)
        }

        return `${left.name}`.localeCompare(`${right.name}`, 'pt-BR')
      })
  }, [tagSearchQuery, tags])

  const selectedTag = useMemo(
    () => tags.find((tag) => tag.id === selectedTagId) || null,
    [selectedTagId, tags]
  )

  const emptyTagsCount = useMemo(
    () => tags.filter((tag) => (tag.count || 0) === 0).length,
    [tags]
  )

  const totalAssignments = useMemo(
    () => tags.reduce((sum, tag) => sum + (tag.count || 0), 0),
    [tags]
  )

  const topTag = filteredTags[0] || tags[0] || null
  const previewSignals = useMemo(() => extractSignals(previewBookmarks), [previewBookmarks])
  const selectedHealth = getTagHealth(selectedTag)

  useEffect(() => {
    if (selectedTag && !isCreating) {
      return
    }

    if (filteredTags.length > 0) {
      setSelectedTagId(filteredTags[0].id)
      setIsCreating(false)
      return
    }

    setSelectedTagId(null)
  }, [filteredTags, isCreating, selectedTag])

  useEffect(() => {
    if (isCreating) {
      setDraftName('')
      setDraftColor(COLOR_OPTIONS[0])
      setPreviewBookmarks([])
      return
    }

    if (!selectedTag) {
      return
    }

    setDraftName(selectedTag.name)
    setDraftColor(selectedTag.color || COLOR_OPTIONS[0])
  }, [isCreating, selectedTag])

  useEffect(() => {
    if (!selectedTag || isCreating) {
      setPreviewBookmarks([])
      return
    }

    let cancelled = false

    const loadPreview = async () => {
      setPreviewLoading(true)

      try {
        const result = await api.getBookmarksWithTags({
          tag: selectedTag.name,
          view: 'all',
          offset: 0,
          limit: 4
        })

        if (!cancelled) {
          setPreviewBookmarks(Array.isArray(result?.items) ? result.items : [])
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Erro ao carregar preview da tag:', error)
          setPreviewBookmarks([])
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false)
        }
      }
    }

    loadPreview()

    return () => {
      cancelled = true
    }
  }, [isCreating, selectedTag])

  const handleCreateMode = () => {
    setFeedback({ type: '', message: '' })
    setIsCreating(true)
    setSelectedTagId(null)
  }

  const handleSelectTag = (tagId) => {
    setFeedback({ type: '', message: '' })
    setIsCreating(false)
    setSelectedTagId(tagId)
  }

  const handleSave = async () => {
    const trimmedName = draftName.trim()

    if (!trimmedName) {
      setFeedback({ type: 'error', message: 'Defina um nome para a tag antes de salvar.' })
      return
    }

    setIsSaving(true)
    setFeedback({ type: '', message: '' })

    try {
      if (isCreating) {
        await api.createTag(trimmedName, draftColor)
      } else if (selectedTag) {
        await api.updateTag(selectedTag.id, trimmedName, draftColor)
      }

      await loadTags()
      await loadStats()

      const refreshedTags = useAppStore.getState().tags
      const matchingTag = refreshedTags.find((tag) => tag.name.toLowerCase() === trimmedName.toLowerCase())

      setSelectedTagId(matchingTag?.id ?? null)
      setIsCreating(false)
      setFeedback({
        type: 'success',
        message: isCreating ? 'Tag criada e pronta para refinamento.' : 'Tag atualizada com sucesso.'
      })
    } catch (error) {
      console.error('Erro ao salvar tag:', error)
      setFeedback({ type: 'error', message: error.message || 'Não foi possível salvar a tag.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedTag) {
      return
    }

    const confirmed = window.confirm(`Excluir a tag "${selectedTag.name}"? Essa ação remove o vínculo com todos os bookmarks.`)
    if (!confirmed) {
      return
    }

    setIsDeleting(true)
    setFeedback({ type: '', message: '' })

    try {
      await api.deleteTag(selectedTag.id)
      await loadTags()
      await loadStats()
      setSelectedTagId(null)
      setFeedback({ type: 'success', message: 'Tag removida da biblioteca.' })
    } catch (error) {
      console.error('Erro ao excluir tag:', error)
      setFeedback({ type: 'error', message: error.message || 'Não foi possível excluir a tag.' })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="space-y-10">
      <SectionHeader
        label="Tag System"
        title="Governança de tags"
        description="Crie, mantenha e revise o vocabulário que organiza seus bookmarks. A próxima camada aqui é inteligência assistida, não uma segunda taxonomia ambígua."
        actions={[
          <Badge key="coverage" tone="secondary">{formatCount(totalAssignments)} vínculos</Badge>,
          <Badge key="orphan" tone={emptyTagsCount > 0 ? 'default' : 'primary'}>{formatCount(emptyTagsCount)} órfãs</Badge>,
          <Badge key="active" tone="primary">{formatCount(tags.length)} tags</Badge>
        ]}
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(260px,0.95fr)_minmax(420px,1.2fr)_minmax(320px,0.9fr)]">
        <aside className="rounded-layout border border-outline-variant/10 bg-surface-container p-6 shadow-cyan">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-label text-secondary/80">Inventário</p>
              <h3 className="mt-2 font-headline text-2xl font-bold text-on-surface">Catálogo vivo</h3>
            </div>
            <Button size="sm" icon={<Plus size={16} />} onClick={handleCreateMode}>
              Nova
            </Button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <StatCard
              label="Mais usada"
              value={topTag ? topTag.name : 'Sem tags'}
              color="secondary"
              description={topTag ? `${formatCount(topTag.count)} bookmarks ligados hoje.` : 'Crie a primeira tag para iniciar a taxonomia.'}
            />
            <StatCard
              label="Sem uso"
              value={formatCount(emptyTagsCount)}
              color={emptyTagsCount > 0 ? 'tertiary' : 'default'}
              description="Essas tags viram candidatas a merge, remoção ou regra automática."
            />
          </div>

          <div className="mt-6 space-y-3">
            {filteredTags.length === 0 ? (
              <div className="rounded-layout border border-dashed border-outline-variant/20 bg-surface-container-high p-6 text-sm text-on-surface-variant">
                Nenhuma tag corresponde à busca atual.
              </div>
            ) : (
              filteredTags.map((tag) => {
                const health = getTagHealth(tag)
                const isActive = !isCreating && selectedTagId === tag.id

                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleSelectTag(tag.id)}
                    className={`w-full rounded-layout border p-4 text-left transition-all ${
                      isActive
                        ? 'border-secondary/40 bg-surface-container-high shadow-cyan'
                        : 'border-outline-variant/10 bg-surface-container-low hover:border-primary/30 hover:bg-surface-container-high'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-1 h-3 w-3 flex-shrink-0 rounded-full shadow-[0_0_16px_rgba(0,227,253,0.25)]"
                        style={{ backgroundColor: tag.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate font-headline text-lg font-bold text-on-surface">{tag.name}</p>
                          <span className="rounded-full bg-surface-container-highest px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                            {formatCount(tag.count)}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge tone={health?.tone || 'default'} size="sm">{health?.label || 'Sem status'}</Badge>
                          <Badge tone="default" size="sm">Criada em {formatDate(tag.created_at)}</Badge>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        <div className="space-y-8">
          <section className="rounded-layout border border-outline-variant/10 bg-[linear-gradient(180deg,rgba(36,36,58,0.96)_0%,rgba(24,24,42,0.92)_100%)] p-6 shadow-cyan">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-label text-primary/80">{isCreating ? 'Nova tag' : 'Editor principal'}</p>
                <h3 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-on-surface">
                  {isCreating ? 'Modelar nova tag' : selectedTag?.name || 'Selecione uma tag'}
                </h3>
                <p className="mt-3 max-w-2xl text-sm text-on-surface-variant">
                  Comece pelo nome e pela cor. Na próxima etapa, essa mesma lateral deve receber aliases, regras e automações.
                </p>
              </div>
              {!isCreating && selectedHealth && (
                <Badge tone={selectedHealth.tone}>{selectedHealth.label}</Badge>
              )}
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_180px]">
              <div className="space-y-5">
                <Input
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  placeholder="Ex.: AI, React, Segurança, Inspiração"
                />

                <div className="rounded-layout border border-outline-variant/10 bg-surface-container p-5">
                  <p className="section-label text-secondary/80">Cor da aura</p>
                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setDraftColor(color)}
                        className={`h-12 rounded-layout border transition-transform hover:scale-[1.03] ${
                          draftColor === color ? 'border-white/80 ring-2 ring-secondary/30' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Selecionar cor ${color}`}
                      />
                    ))}
                  </div>
                </div>

                {feedback.message && (
                  <div className={`rounded-layout border px-4 py-3 text-sm ${
                    feedback.type === 'error'
                      ? 'border-error/20 bg-error/10 text-error'
                      : 'border-secondary/20 bg-secondary/10 text-secondary'
                  }`}>
                    {feedback.message}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    icon={isSaving ? <Sparkles size={16} /> : <Check size={16} />}
                  >
                    {isSaving ? 'Salvando...' : isCreating ? 'Criar tag' : 'Salvar ajustes'}
                  </Button>

                  {!isCreating && selectedTag && (
                    <Button
                      variant="danger"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      icon={<Trash2 size={16} />}
                    >
                      {isDeleting ? 'Excluindo...' : 'Excluir'}
                    </Button>
                  )}
                </div>
              </div>

              <div className="rounded-layout border border-outline-variant/10 bg-surface-container p-5">
                <p className="section-label text-tertiary/80">Preview</p>
                <div className="mt-4 rounded-layout border border-outline-variant/10 bg-surface-container-low p-5">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-4 w-4 rounded-full shadow-[0_0_16px_rgba(255,255,255,0.15)]"
                      style={{ backgroundColor: draftColor }}
                    />
                    <span className="font-headline text-xl font-bold text-on-surface">
                      {draftName.trim() || 'Nome da tag'}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-on-surface-variant">
                    Use esse preview para calibrar cor, contraste e tom antes de aplicar em massa.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-layout border border-outline-variant/10 bg-surface-container p-6 shadow-cyan">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-label text-secondary/80">Roadmap inteligente</p>
                <h3 className="mt-2 font-headline text-2xl font-bold text-on-surface">Próximas camadas da tela</h3>
              </div>
              <Badge tone="secondary">Start v1</Badge>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <StatCard
                label="Agora"
                value="CRUD"
                color="secondary"
                description="Criar, editar, apagar e entender cobertura real das tags no acervo."
              />
              <StatCard
                label="Depois"
                value="Regras"
                color="tertiary"
                description="Autores, domínios e palavras-chave viram gatilhos de sugestão revisável."
              />
              <StatCard
                label="Mais adiante"
                value="IA"
                description="Similaridade textual, confiança e revisão por lote na importação."
              />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-layout border border-outline-variant/10 bg-surface-container p-6 shadow-cyan">
            <p className="section-label text-secondary/80">Impacto</p>
            <h3 className="mt-2 font-headline text-2xl font-bold text-on-surface">Onde ela aparece</h3>

            <div className="mt-6 grid gap-4">
              <StatCard
                label="Bookmarks ligados"
                value={formatCount(selectedTag?.count || 0)}
                color="secondary"
                description="Cobertura atual da tag na biblioteca ativa."
              />
              <StatCard label="Signals" className="bg-surface-container">
                <div className="mt-4 flex flex-wrap gap-2">
                  {previewSignals.handles.map((handle) => (
                    <Badge key={handle} tone="secondary" size="sm">{handle}</Badge>
                  ))}
                  {previewSignals.domains.map((domain) => (
                    <Badge key={domain} tone="default" size="sm">{domain}</Badge>
                  ))}
                  {previewSignals.handles.length === 0 && previewSignals.domains.length === 0 && (
                    <p className="text-sm text-on-surface-variant">
                      Salve uma tag e comece a observar autores, domínios e padrões recorrentes aqui.
                    </p>
                  )}
                </div>
              </StatCard>
            </div>
          </section>

          <section className="rounded-layout border border-outline-variant/10 bg-surface-container p-6 shadow-cyan">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="section-label text-primary/80">Preview de tweets</p>
                <h3 className="mt-2 font-headline text-2xl font-bold text-on-surface">Amostra da tag</h3>
              </div>
              {selectedTag && <Badge tone="primary">{selectedTag.name}</Badge>}
            </div>

            <div className="mt-6 space-y-4">
              {previewLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
                </div>
              ) : previewBookmarks.length === 0 ? (
                <div className="rounded-layout border border-dashed border-outline-variant/20 bg-surface-container-high p-5 text-sm text-on-surface-variant">
                  {isCreating
                    ? 'A nova tag ainda não tem impacto. Salve primeiro para começar a preenchê-la.'
                    : 'Nenhum bookmark ligado a esta tag por enquanto.'}
                </div>
              ) : (
                previewBookmarks.map((bookmark) => (
                  <article
                    key={bookmark.id}
                    className="rounded-layout border border-outline-variant/10 bg-surface-container-high p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/20 bg-surface-container-highest text-xs font-bold text-on-surface">
                        {bookmark.author_name?.slice(0, 2)?.toUpperCase() || 'TW'}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-on-surface">{bookmark.author_name}</p>
                        <p className="truncate text-xs text-on-surface-variant">@{bookmark.author_handle}</p>
                      </div>
                    </div>
                    <TweetText text={bookmark.full_text} className="mt-4 line-clamp-4 text-sm leading-relaxed text-on-surface/85" />
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-layout border border-outline-variant/10 bg-surface-container p-6 shadow-cyan">
            <p className="section-label text-tertiary/80">Conceito</p>
            <div className="mt-4 space-y-4 text-sm text-on-surface-variant">
              <div className="flex gap-3">
                <Hash size={18} className="mt-0.5 text-secondary" />
                <p>Tag organiza o mesmo tweet em múltiplos eixos, sem limitar a um único agrupamento.</p>
              </div>
              <div className="flex gap-3">
                <PaintBucket size={18} className="mt-0.5 text-primary" />
                <p>Coleção só deve voltar quando ganhar semântica própria de curadoria ou filtro salvo.</p>
              </div>
              <div className="flex gap-3">
                <AlertTriangle size={18} className="mt-0.5 text-tertiary" />
                <p>Evitar dois conceitos que resolvem o mesmo problema mantém a navegação previsível.</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </section>
  )
}
