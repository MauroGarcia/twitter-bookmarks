import { app, shell } from 'electron'
import { spawn } from 'child_process'
import crypto from 'crypto'
import fs from 'fs'
import http from 'http'
import path from 'path'

const AUTH_BASE_URL = 'https://x.com/i/oauth2/authorize'
const TOKEN_URL = 'https://api.x.com/2/oauth2/token'
const USER_LOOKUP_URL = 'https://api.x.com/2/users/me'
const DEFAULT_REDIRECT_URI = 'http://127.0.0.1:3000/callback'
const DEFAULT_SCOPES = ['bookmark.read', 'tweet.read', 'users.read', 'offline.access']
const AUTH_STORE_FILE_NAME = 'x-auth.json'
const CALLBACK_TIMEOUT_MS = 180_000

function getStorePath() {
  return path.join(app.getPath('userData'), AUTH_STORE_FILE_NAME)
}

function getDefaultState() {
  return {
    config: {
      clientId: '',
      clientSecret: '',
      redirectUri: DEFAULT_REDIRECT_URI,
      scopes: DEFAULT_SCOPES
    },
    tokens: null,
    profile: null,
    lastSyncedAt: null,
    bookmarksNextToken: null
  }
}

function readStore() {
  try {
    const raw = fs.readFileSync(getStorePath(), 'utf8')
    const parsed = JSON.parse(raw)

    return {
      ...getDefaultState(),
      ...parsed,
      config: {
        ...getDefaultState().config,
        ...(parsed?.config || {})
      }
    }
  } catch {
    return getDefaultState()
  }
}

function writeStore(nextState) {
  fs.writeFileSync(getStorePath(), JSON.stringify(nextState, null, 2), 'utf8')
}

function toBase64Url(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function createPkcePair() {
  const verifier = toBase64Url(crypto.randomBytes(48))
  const challenge = toBase64Url(crypto.createHash('sha256').update(verifier).digest())

  return {
    verifier,
    challenge
  }
}

function parseRedirectUri(redirectUri) {
  const url = new URL(redirectUri)

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Redirect URI deve usar HTTP(S)')
  }

  return {
    hostname: url.hostname,
    port: Number(url.port || (url.protocol === 'https:' ? 443 : 80)),
    pathname: url.pathname || '/'
  }
}

async function prepareAuthorizationCallback(redirectUri, expectedState) {
  const { hostname, port, pathname } = parseRedirectUri(redirectUri)

  let resolveCode
  let rejectCode
  const codePromise = new Promise((resolve, reject) => {
    resolveCode = resolve
    rejectCode = reject
  })

  const server = http.createServer((request, response) => {
    try {
      const requestUrl = new URL(request.url, `${request.socket.encrypted ? 'https' : 'http'}://${request.headers.host}`)

      if (requestUrl.pathname !== pathname) {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
        response.end('Callback inválido.')
        return
      }

      const code = requestUrl.searchParams.get('code')
      const state = requestUrl.searchParams.get('state')
      const error = requestUrl.searchParams.get('error')

      if (error) {
        response.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' })
        response.end('<h1>Falha na autenticação</h1><p>Você já pode fechar esta aba.</p>')
        server.close(() => rejectCode(new Error(`Autorização recusada pela X API: ${error}`)))
        return
      }

      if (!code || state !== expectedState) {
        response.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' })
        response.end('<h1>Callback inválido</h1><p>Você já pode fechar esta aba.</p>')
        server.close(() => rejectCode(new Error('Resposta de autenticação inválida da X API')))
        return
      }

      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      response.end('<h1>Conexão concluída</h1><p>Você já pode fechar esta aba e voltar para o app.</p>')
      server.close(() => resolveCode(code))
    } catch (error) {
      server.close(() => rejectCode(error))
    }
  })

  const readyPromise = new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      server.close(() => reject(new Error('Tempo limite excedido ao aguardar autorização da X API')))
      rejectCode(new Error('Tempo limite excedido ao aguardar autorização da X API'))
    }, CALLBACK_TIMEOUT_MS)

    server.on('close', () => {
      clearTimeout(timeoutId)
    })

    server.on('error', (error) => {
      clearTimeout(timeoutId)
      if (error?.code === 'EADDRINUSE') {
        const wrappedError = new Error(`A porta ${port} já está em uso. Altere o Redirect URI ou libere essa porta antes de conectar.`)
        reject(wrappedError)
        rejectCode(wrappedError)
        return
      }

      reject(error)
      rejectCode(error)
    })

    server.listen(port, hostname, () => {
      console.log(`[X Auth] Callback server listening at ${hostname}:${port}${pathname}`)
      resolve()
    })
  })

  await readyPromise

  return {
    codePromise,
    close: () => {
      if (server.listening) {
        server.close()
      }
    }
  }
}

async function exchangeAuthorizationCode({ code, verifier, config }) {
  const body = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    code_verifier: verifier
  })

  if (config.clientSecret) {
    body.set('client_secret', config.clientSecret)
  }

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Falha ao trocar o authorization code por token (${response.status}): ${details}`)
  }

  return response.json()
}

async function refreshAccessToken({ refreshToken, config }) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: config.clientId
  })

  if (config.clientSecret) {
    body.set('client_secret', config.clientSecret)
  }

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Falha ao renovar token da X API (${response.status}): ${details}`)
  }

  return response.json()
}

async function fetchUserProfile(accessToken) {
  const response = await fetch(`${USER_LOOKUP_URL}?user.fields=id,name,username,profile_image_url`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Falha ao buscar perfil do usuário na X API (${response.status}): ${details}`)
  }

  const payload = await response.json()
  return payload.data || null
}

function normalizeTokenPayload(tokenPayload, currentTokens = null) {
  return {
    accessToken: tokenPayload.access_token,
    refreshToken: tokenPayload.refresh_token || currentTokens?.refreshToken || null,
    tokenType: tokenPayload.token_type || 'bearer',
    scope: tokenPayload.scope || '',
    expiresIn: tokenPayload.expires_in || null,
    obtainedAt: new Date().toISOString()
  }
}

async function openAuthorizationInSystemBrowser(authorizationUrl) {
  try {
    await shell.openExternal(authorizationUrl, { activate: true })
    return
  } catch (error) {
    console.error('[X Auth] shell.openExternal failed:', error)
  }

  if (process.platform === 'win32') {
    await new Promise((resolve, reject) => {
      const child = spawn('cmd', ['/c', 'start', '', authorizationUrl], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true
      })

      child.once('error', (error) => {
        reject(error)
      })

      child.once('spawn', () => {
        child.unref()
        resolve()
      })
    })
    return
  }

  throw new Error('Não foi possível abrir o navegador padrão para autenticação.')
}

export function getXAuthStatus() {
  const state = readStore()

  return {
    hasConfig: Boolean(state.config.clientId && state.config.redirectUri),
    connected: Boolean(state.tokens?.accessToken && state.profile?.id),
    config: {
      clientId: state.config.clientId,
      hasClientSecret: Boolean(state.config.clientSecret),
      redirectUri: state.config.redirectUri,
      scopes: state.config.scopes
    },
    profile: state.profile,
    lastSyncedAt: state.lastSyncedAt,
    hasPendingBookmarkPages: Boolean(state.bookmarksNextToken)
  }
}

export function getXBookmarksSyncCursor() {
  const state = readStore()

  return {
    nextToken: state.bookmarksNextToken || null
  }
}

export function saveXAuthConfig(config = {}) {
  const state = readStore()
  const nextState = {
    ...state,
    config: {
      ...state.config,
      clientId: `${config.clientId || state.config.clientId || ''}`.trim(),
      clientSecret: `${config.clientSecret || state.config.clientSecret || ''}`.trim(),
      redirectUri: `${config.redirectUri || state.config.redirectUri || DEFAULT_REDIRECT_URI}`.trim(),
      scopes: Array.isArray(config.scopes) && config.scopes.length > 0
        ? config.scopes
        : state.config.scopes
    }
  }

  if (!nextState.config.clientId) {
    throw new Error('Client ID é obrigatório')
  }

  writeStore(nextState)
  return getXAuthStatus()
}

export async function connectXAccount(config = {}) {
  saveXAuthConfig(config)
  const state = readStore()
  const { verifier, challenge } = createPkcePair()
  const expectedState = toBase64Url(crypto.randomBytes(24))
  const authorizationUrl = new URL(AUTH_BASE_URL)

  authorizationUrl.searchParams.set('response_type', 'code')
  authorizationUrl.searchParams.set('client_id', state.config.clientId)
  authorizationUrl.searchParams.set('redirect_uri', state.config.redirectUri)
  authorizationUrl.searchParams.set('scope', state.config.scopes.join(' '))
  authorizationUrl.searchParams.set('state', expectedState)
  authorizationUrl.searchParams.set('code_challenge', challenge)
  authorizationUrl.searchParams.set('code_challenge_method', 'S256')

  const { codePromise, close } = await prepareAuthorizationCallback(state.config.redirectUri, expectedState)

  try {
    console.log('[X Auth] Opening authorization URL in system browser:', authorizationUrl.toString())
    await openAuthorizationInSystemBrowser(authorizationUrl.toString())
  } catch (error) {
    close()
    throw new Error(`Não foi possível iniciar a autenticação da X API: ${error.message}`)
  }

  const code = await codePromise
  const tokenPayload = await exchangeAuthorizationCode({ code, verifier, config: state.config })
  const tokens = normalizeTokenPayload(tokenPayload)
  const profile = await fetchUserProfile(tokens.accessToken)

  writeStore({
    ...state,
    tokens,
    profile,
    lastSyncedAt: null,
    bookmarksNextToken: null
  })

  return getXAuthStatus()
}

export async function getValidXAccessToken() {
  const state = readStore()

  if (!state.tokens?.accessToken) {
    throw new Error('Nenhuma conta X conectada')
  }

  const obtainedAt = state.tokens.obtainedAt ? new Date(state.tokens.obtainedAt).getTime() : 0
  const expiresAt = state.tokens.expiresIn ? obtainedAt + (state.tokens.expiresIn * 1000) : Number.POSITIVE_INFINITY
  const needsRefresh = Number.isFinite(expiresAt) && (Date.now() + 60_000) >= expiresAt

  if (!needsRefresh) {
    return state.tokens.accessToken
  }

  if (!state.tokens.refreshToken) {
    return state.tokens.accessToken
  }

  const refreshed = await refreshAccessToken({
    refreshToken: state.tokens.refreshToken,
    config: state.config
  })
  const nextTokens = normalizeTokenPayload(refreshed, state.tokens)
  const nextState = {
    ...state,
    tokens: nextTokens
  }

  writeStore(nextState)
  return nextTokens.accessToken
}

export function disconnectXAccount() {
  const state = readStore()
  writeStore({
    ...state,
    tokens: null,
    profile: null,
    lastSyncedAt: null,
    bookmarksNextToken: null
  })

  return getXAuthStatus()
}

export function markXBookmarksSynced({ nextToken = null } = {}) {
  const state = readStore()
  writeStore({
    ...state,
    lastSyncedAt: new Date().toISOString(),
    bookmarksNextToken: nextToken || null
  })
}
