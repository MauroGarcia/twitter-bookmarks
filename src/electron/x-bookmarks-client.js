import * as db from './db.js'
import { getValidXAccessToken, getXAuthStatus, markXBookmarksSynced } from './x-auth.js'

const X_API_BASE_URL = 'https://api.x.com/2'
const BOOKMARK_PAGE_SIZE = 10
const ARTICLE_TAG_NAME = 'article'
const ARTICLE_TAG_COLOR = '#f97316'

function buildTweetUrl(tweetId, username) {
  return `https://twitter.com/${username || 'i'}/status/${tweetId}`
}

function mapUsersById(users = []) {
  return new Map(users.map((user) => [user.id, user]))
}

function mapMediaByKey(media = []) {
  return new Map(media.map((item) => [item.media_key, item]))
}

function mapTweetsById(tweets = []) {
  return new Map(tweets.map((tweet) => [tweet.id, tweet]))
}

async function fetchJson(url, accessToken) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Falha na X API (${response.status}): ${details}`)
  }

  return response.json()
}

async function getCurrentUser(accessToken) {
  const payload = await fetchJson(`${X_API_BASE_URL}/users/me?user.fields=id,name,username,profile_image_url`, accessToken)
  return payload.data
}

function extractMediaUrls(tweet, mediaByKey) {
  const mediaKeys = tweet.attachments?.media_keys || []

  return mediaKeys
    .map((mediaKey) => mediaByKey.get(mediaKey))
    .filter(Boolean)
    .map((media) => media.url || media.preview_image_url)
    .filter(Boolean)
}

function extractArticleMediaUrls(article = {}, mediaByKey) {
  const mediaKeys = [
    typeof article.cover_media === 'string'
      ? article.cover_media
      : article.cover_media?.media_key,
    ...(Array.isArray(article.media_entities)
      ? article.media_entities.map((item) => (typeof item === 'string' ? item : item?.media_key))
      : [])
  ].filter(Boolean)

  return [...new Set(mediaKeys)]
    .map((mediaKey) => mediaByKey.get(mediaKey))
    .filter(Boolean)
    .map((media) => media.url || media.preview_image_url)
    .filter(Boolean)
}

function getTweetText(tweet) {
  return tweet?.note_tweet?.text || tweet?.text || ''
}

function buildReferencedTweetRecord(tweet, userById) {
  if (!tweet) {
    return null
  }

  const author = userById.get(tweet.author_id) || {}

  return {
    author_name: author.name || 'Unknown',
    author_handle: author.username || 'unknown',
    author_avatar_url: author.profile_image_url || null,
    created_at: tweet.created_at || null,
    full_text: getTweetText(tweet)
  }
}

function resolveQuotedTweet(tweet, referencedTweetsById, userById) {
  const references = Array.isArray(tweet.referenced_tweets) ? tweet.referenced_tweets : []

  const preferredReference = references.find((reference) => reference.type === 'quoted')
    || references.find((reference) => reference.type === 'retweeted')

  if (!preferredReference?.id) {
    return null
  }

  return buildReferencedTweetRecord(referencedTweetsById.get(preferredReference.id), userById)
}

function buildArticleData(tweet, mediaByKey) {
  if (!tweet.article) {
    return null
  }

  const articleMediaUrls = extractArticleMediaUrls(tweet.article, mediaByKey)
  const text = [
    tweet.article.plain_text,
    tweet.article.summary,
    tweet.article.preview_text,
    tweet.article.subtitle,
    tweet.article.text,
    tweet.article.body
  ].find((value) => typeof value === 'string' && value.trim())

  const links = Array.isArray(tweet.article.entities?.urls)
    ? tweet.article.entities.urls
      .map((item) => {
        if (typeof item === 'string') {
          return { href: item, label: item }
        }

        const href = item.text || item.url || item.expanded_url
        if (!href) return null

        return {
          href,
          label: item.display_url || href
        }
      })
      .filter(Boolean)
    : []

  return {
    title: tweet.article.title || '',
    text: text || '',
    media_urls: articleMediaUrls,
    links
  }
}

function isBareExternalLink(text, urls) {
  const normalizedText = `${text || ''}`.trim()
  return Boolean(
    normalizedText &&
    Array.isArray(urls) &&
    urls.some((item) => item?.url === normalizedText)
  )
}

function normalizeTweetRecord(tweet, userById, mediaByKey, referencedTweetsById) {
  const author = userById.get(tweet.author_id) || {}
  const mediaUrls = extractMediaUrls(tweet, mediaByKey)
  const references = Array.isArray(tweet.referenced_tweets) ? tweet.referenced_tweets : []
  const retweetedReference = references.find((reference) => reference.type === 'retweeted')
  const retweetedTweet = retweetedReference ? referencedTweetsById.get(retweetedReference.id) : null
  const linkItems = tweet.entities?.urls?.map((item) => ({
    url: item.url,
    expanded_url: item.expanded_url
  })) || null
  const articleData = buildArticleData(tweet, mediaByKey)
  const baseText = retweetedTweet ? getTweetText(retweetedTweet) : getTweetText(tweet)
  const normalizedText = articleData?.title && isBareExternalLink(baseText, linkItems)
    ? articleData.title
    : baseText

  return {
    id: tweet.id,
    tweet_url: buildTweetUrl(tweet.id, author.username),
    full_text: normalizedText,
    author_name: author.name || 'Unknown',
    author_handle: author.username || 'unknown',
    author_avatar_url: author.profile_image_url || null,
    created_at: tweet.created_at || new Date().toISOString(),
    imported_at: new Date().toISOString(),
    like_count: tweet.public_metrics?.like_count || 0,
    retweet_count: tweet.public_metrics?.retweet_count || 0,
    has_media: mediaUrls.length > 0 || (articleData?.media_urls?.length ?? 0) > 0,
    media_urls: mediaUrls.length > 0
      ? mediaUrls
      : (articleData?.media_urls?.length ? articleData.media_urls : null),
    urls: linkItems,
    article_data: articleData,
    quoted_tweet: resolveQuotedTweet(tweet, referencedTweetsById, userById),
    raw_json: tweet
  }
}

async function fetchAllBookmarks() {
  const accessToken = await getValidXAccessToken()
  const currentUser = await getCurrentUser(accessToken)

  if (!currentUser?.id) {
    throw new Error('Não foi possível determinar o usuário autenticado na X API')
  }

  const collected = []
  const url = new URL(`${X_API_BASE_URL}/users/${currentUser.id}/bookmarks`)
  url.searchParams.set('max_results', `${BOOKMARK_PAGE_SIZE}`)
  url.searchParams.set(
    'tweet.fields',
    'article,attachments,author_id,created_at,entities,note_tweet,public_metrics,referenced_tweets'
  )
  url.searchParams.set('user.fields', 'id,name,username,profile_image_url')
  url.searchParams.set('media.fields', 'media_key,preview_image_url,type,url')
  url.searchParams.set('expansions', 'author_id,attachments.media_keys,referenced_tweets.id,referenced_tweets.id.author_id,article.cover_media,article.media_entities')

  const payload = await fetchJson(url, accessToken)
  const tweets = payload.data || []
  const userById = mapUsersById(payload.includes?.users)
  const mediaByKey = mapMediaByKey(payload.includes?.media)
  const referencedTweetsById = mapTweetsById(payload.includes?.tweets)

  tweets.forEach((tweet) => {
    collected.push(normalizeTweetRecord(tweet, userById, mediaByKey, referencedTweetsById))
  })

  return collected
}

function ensureArticleTag() {
  const existingTag = db.getTagByName(ARTICLE_TAG_NAME)

  if (existingTag) {
    return existingTag
  }

  const result = db.createTag(ARTICLE_TAG_NAME, ARTICLE_TAG_COLOR)
  return db.getTagById(result.lastInsertRowid)
}

export async function syncXBookmarks() {
  const status = getXAuthStatus()

  if (!status.connected) {
    throw new Error('Conecte sua conta X antes de sincronizar')
  }

  const bookmarks = await fetchAllBookmarks()

  const insertBookmarks = db.default.transaction(() => {
    let imported = 0
    let updated = 0
    const articleTag = ensureArticleTag()

    for (const bookmark of bookmarks) {
      if (db.getBookmarkById(bookmark.id)) {
        db.upsertBookmark(bookmark)
        updated += 1
      } else {
        db.createBookmark(bookmark)
        imported += 1
      }

      if (bookmark.article_data && articleTag?.id) {
        const currentTagIds = (db.getBookmarkTags(bookmark.id) || []).map((tag) => tag.id)
        if (!currentTagIds.includes(articleTag.id)) {
          db.setBookmarkTags(bookmark.id, [...currentTagIds, articleTag.id])
        }
      }
    }

    return { imported, updated }
  })

  const result = insertBookmarks()
  markXBookmarksSynced()

  return {
    success: true,
    imported: result.imported,
    updated: result.updated,
    totalFetched: bookmarks.length,
    message: result.imported > 0 || result.updated > 0
      ? `${result.imported} novos e ${result.updated} atualizados da X API`
      : 'Nenhum bookmark novo encontrado na X API'
  }
}
