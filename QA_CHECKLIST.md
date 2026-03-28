# QA Checklist - Twitter Bookmarks Organizer

**Objetivo:** Garantir que todas as funcionalidades críticas foram testadas antes de produção.

**Versão:** 1.0
**Data:** 2026-03-28
**Próxima Revisão:** Após fixes dos bugs críticos

---

## 🟥 CRITICAL TESTS (Deve passar 100%)

### Import Functionality
- [ ] **IMPORT-001** Arquivo válido com 50+ tweets importa corretamente
- [ ] **IMPORT-002** Arquivo JSON inválido é rejeitado com erro legível
- [ ] **IMPORT-003** Duplicatas (mesmo tweet_id) são ignoradas
- [ ] **IMPORT-004** Dados faltantes (author.name) recebem fallback values
- [ ] **IMPORT-007** 1000+ bookmarks importam em <5 segundos
- [ ] **IMPORT-012** URL do tweet é construída corretamente (sem null screen_name)

### Data Integrity
- [ ] **DELETE-003** Delete cascata funciona em bookmark_tags
- [ ] **DELETE-004** Delete cascata funciona em notes
- [ ] **DELETE-005** Delete remove do FTS5 corretamente
- [ ] **BUG-001** Import usa transaction (sem partial inserts)
- [ ] **BUG-009** DB schema está versionado (migration ready)

### Search & Filter
- [ ] **SEARCH-001** Full-text search por palavra-chave funciona
- [ ] **SEARCH-003** Filtro por tag reduz listagem corretamente
- [ ] **SEARCH-004** Combinação tag+search filtra por ambos
- [ ] **SEARCH-007** Busca em 1000 bookmarks retorna em <1s

### UI Responsiveness
- [ ] **UI-003** 1000 bookmarks renderizam em <3 segundos
- [ ] **IPC-001** window.api está disponível com todos os métodos
- [ ] **IPC-003** Context isolation está ativo (security)
- [ ] **IPC-004** Node integration está desativado (security)

---

## 🟧 IMPORTANT TESTS (Deve passar 95%+)

### Tags CRUD
- [ ] **TAG-001** Criar tag com nome único funciona
- [ ] **TAG-002** Duplicata é rejeitada ou ignorada
- [ ] **TAG-003** Atribuir tag a bookmark persiste
- [ ] **TAG-004** Remover tag remove corretamente
- [ ] **TAG-007** Criar tag inline em detail funciona

### Notes Management
- [ ] **NOTE-001** Criar nota persiste no DB
- [ ] **NOTE-002** Editar nota atualiza updated_at
- [ ] **NOTE-005** Nota carrega corretamente ao reabrir

### Error Handling
- [ ] **BUG-002** FTS5 sem caracteres especiais quebrados (+, -, :)
- [ ] **BUG-005** Search tem debounce (não spike CPU)
- [ ] **BUG-006** Tag vazia é validada
- [ ] **BUG-007** Todos os IPC handlers têm try-catch

---

## 🟨 IMPORTANT IMPROVEMENTS (Deve passar 80%+)

### Performance Optimization
- [ ] **UI-007** Texto longo é truncado em cards (line-clamp-3)
- [ ] **UI-008** Modal scrollável para conteúdo longo
- [ ] Nenhuma memory leak detectada em DevTools

### UX Refinements
- [ ] **DELETE-001** Delete com confirmação funciona
- [ ] **DELETE-002** Cancelar delete não deleta
- [ ] **IMPORT-006** Cancelar dialog não importa
- [ ] Mensagens de erro são legíveis ao usuário

### Responsive Design
- [ ] **UI-004** Layout correto em 1920x1080 (desktop)
- [ ] **UI-005** Layout funcional em 768px (tablet)
- [ ] Sem elementos cortados em diferentes resoluções

---

## 🟢 NICE TO HAVE TESTS (Pode passar 70%+)

### Advanced Features
- [ ] [ ] TAG-008 Sidebar com contagem de tags atualiza
- [ ] [ ] TAG-006 Cores customizadas de tags exibem corretamente
- [ ] [ ] UI-001 Estado vazio com 0 bookmarks é legível
- [ ] [ ] UI-002 Layout correto com 20-100 bookmarks
- [ ] [ ] UI-006 Avatar images com link quebrado não quebra layout

### Edge Cases
- [ ] [ ] IMPORT-005 Arquivo vazio importa sem erro (0 bookmarks)
- [ ] [ ] IMPORT-008 Arquivo deletado após diálogo retorna erro
- [ ] [ ] SEARCH-002 Busca vazia retorna todos
- [ ] [ ] SEARCH-005 Filtro por autor funciona (se exposto)
- [ ] [ ] NOTE-004 Deletar nota (string vazia) funciona

---

## 📊 Test Execution Tracking

### Smoke Tests (Rápidos - ~30 min)
```
Data: ___________
Executado por: ___________
Resultado: ___________

[ ] IMPORT-001 ✓/✗/⚠️
[ ] IMPORT-002 ✓/✗/⚠️
[ ] SEARCH-001 ✓/✗/⚠️
[ ] TAG-001    ✓/✗/⚠️
[ ] NOTE-001   ✓/✗/⚠️
[ ] DELETE-001 ✓/✗/⚠️
[ ] IPC-001    ✓/✗/⚠️
[ ] UI-003     ✓/✗/⚠️

Passou: ___/8 (alvo: 8/8)
```

### Regression Tests (Completos - ~2 horas)
```
Data: ___________
Executado por: ___________
Resultado: ___________

Críticos:  ___/16 (alvo: 16/16)
Importants: ___/14 (alvo: 13/14)
Nice-to-have: ___/15 (alvo: 10/15)

Total: ___/45 (alvo: 39/45 = 87%)
Passou: [ ] SIM [ ] NÃO
```

### Performance Benchmarks
```
Data: ___________
Ambiente: ___________

Import 1000 bookmarks:
  Target: <5s
  Atual:  ___s
  Status: [ ] PASS [ ] FAIL

Renderizar 1000 bookmarks:
  Target: <3s
  Atual:  ___s
  Status: [ ] PASS [ ] FAIL

Search FTS5 1000 bookmarks:
  Target: <1s
  Atual:  ___s
  Status: [ ] PASS [ ] FAIL

Memory footprint:
  Target: <300MB
  Atual:  ___MB
  Status: [ ] PASS [ ] FAIL
```

---

## 🔍 Manual Test Scenarios (Desktop Testing)

### Scenario 1: Happy Path (5 min)
```
1. [ ] Abrir app
2. [ ] Clicar "Importar Bookmarks"
3. [ ] Selecionar arquivo válido (50+ tweets)
4. [ ] Verificar contagem na mensagem
5. [ ] Verificar que bookmarks aparecem na lista
6. [ ] Clicar um bookmark, abrir detail
7. [ ] Fechar detail (X button)
```

### Scenario 2: Search & Filter (10 min)
```
1. [ ] Digitar palavra comum na busca (ex: "react")
2. [ ] Verificar filtragem em tempo real
3. [ ] Clicar tag no sidebar
4. [ ] Verificar que filtra por tag
5. [ ] Digitar busca enquanto tag selecionada
6. [ ] Verificar combinação (tag AND search)
7. [ ] Limpar ambos os filtros
```

### Scenario 3: Tags & Notes (10 min)
```
1. [ ] Abrir detail
2. [ ] Criar nova tag (inline)
3. [ ] Selecionar tag criada
4. [ ] Salvar e verificar que aparece
5. [ ] Clicar "Editar" em Notas
6. [ ] Digitar nota e salvar
7. [ ] Fechar e reabrir, verificar persistência
```

### Scenario 4: Delete & Cascata (5 min)
```
1. [ ] Bookmark com tags + nota
2. [ ] Clicar "Deletar Bookmark"
3. [ ] Confirmar delete
4. [ ] Verificar que sumiu da lista
5. [ ] Verificar que tags não foram deletadas (em sidebar)
6. [ ] (DB check: bookmark_tags limpo, notes limpo)
```

### Scenario 5: Error Handling (5 min)
```
1. [ ] Importar arquivo inválido
2. [ ] Verificar que erro é exibido
3. [ ] Criar tag com nome vazio
4. [ ] Verificar se é rejeitado ou ignorado
5. [ ] Buscar com caracteres especiais (+, -)
6. [ ] Verificar sem erro SQL
```

### Scenario 6: Performance (10 min)
```
1. [ ] Importar 1000 bookmarks
2. [ ] Medir tempo (DevTools > Performance)
3. [ ] Scroll pela lista, observar FPS (target: >30)
4. [ ] Executar busca, observar latência (target: <1s)
5. [ ] Observar memory no DevTools (target: <300MB)
```

---

## 🐛 Bug Verification Checklist

### Critical Bugs (Must Verify Fixed)
- [ ] **BUG-001** Import com transaction
  - Arquivo > 100 bookmarks
  - Nenhum erro = nenhum bookmark perdido

- [ ] **BUG-003** Sem virtualization
  - 1000 bookmarks renderiza em <3s
  - Scroll >30 FPS (DevTools > Performance)

- [ ] **BUG-004** Tags loading batch
  - Medir IPC calls ao carregar lista (target: <10)
  - Não deve fazer 50+ calls em série

- [ ] **BUG-005** Search debounce
  - Digitar "javascript" não dispara 10x
  - CPU não spikes (DevTools > Performance)

- [ ] **BUG-007** Try-catch em handlers
  - Forçar erro em DB (ex: simular locked)
  - App não quebra, erro é capturado

### High Priority Bugs
- [ ] **BUG-002** FTS5 sanitização
  - Buscar: "+javascript -python"
  - Sem SQL error (ou tratado gracefully)

- [ ] **BUG-006** Tag vazio validado
  - Digitar apenas espaços em novo tag
  - Rejeitado ou ignorado

- [ ] **BUG-009** Schema versioning
  - Verificar versão em DB
  - Migration path exist para v2.0

- [ ] **BUG-012** URL tweet corrigida
  - Importar tweet com author=null
  - URL não contém "null" na string

---

## ✅ Sign-Off Checklist

### Pre-Release (Before Publishing Installer)

#### QA Lead
- [ ] Todos os testes críticos passaram
- [ ] Nenhum bug crítico aberto
- [ ] Performance benchmarks atingidos
- [ ] Documentação QA completa

#### Dev Lead
- [ ] Código review completo
- [ ] Bugs críticos/altos resolvidos
- [ ] Build sem warnings/errors
- [ ] Versão incrementada

#### Security Review
- [ ] Context isolation ativo
- [ ] Node integration OFF
- [ ] Sem hardcoded credentials
- [ ] IPC handlers validam input

#### Product Owner
- [ ] Funcionalidades alinhadas com spec
- [ ] Não há blockers conhecidos
- [ ] Release notes preparados
- [ ] User documentation atualizada

---

## 📈 Acceptance Criteria

### Build Release
```
✓ 100% dos testes críticos passando
✓ 95%+ dos testes importantes passando
✓ 0 bugs bloqueadores abertos
✓ Performance: <3s render, <1s search, <300MB memory
✓ Nenhuma log ERROR em console durante uso normal
✓ Nenhuma crash ou memory leak após 30min de uso
✓ Security scanning sem HIGH findings
```

### Installer Quality
```
✓ Arquivo .exe gerado sem erros
✓ Instalação funciona (clean + update)
✓ Desinstalação limpa
✓ Atalhos corretos no menu
✓ BD persiste após restart
```

### Documentation
```
✓ README com instruções claras
✓ Known issues documentados
✓ Performance baseline estabelecido
✓ QA test plan versionado
```

---

## 🚨 Critical Issues Found During Testing

**Preencher durante testes:**

| Data | Severidade | Component | Descrição | Status |
|------|-----------|-----------|-----------|--------|
| | | | | |
| | | | | |
| | | | | |

---

## 📝 Test Notes

**Use este espaço para anotações durante testes:**

```
Data:

Ambiente:
- OS:
- Node version:
- Electron version:

Observações:


Issues encontrados:


Recomendações:
```

---

## 📋 Final Approval

| Papel | Nome | Data | Assinatura |
|-------|------|------|-----------|
| QA Lead | | | |
| Dev Lead | | | |
| Product Owner | | | |

**Status Final:** [ ] ✅ APROVADO para PRODUÇÃO
                   [ ] ⚠️ APROVADO COM RESTRIÇÕES
                   [ ] ❌ NÃO APROVADO

**Observações:**

---

**Próximas Ações:**
1.
2.
3.

---

*Documento preenchido em: ___________*
*Última atualização: 2026-03-28*
