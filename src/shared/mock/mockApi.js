import { normalizeBookmarks } from '../lib/bookmark-utils'
import { parseTwitterBookmarksExport } from '../lib/twitter-bookmarks-import'

const MOCK_BOOKMARK_STATE_STORAGE_KEY = 'twitter-bookmarks.mock-state.v1'
const MOCK_IMPORTED_BOOKMARKS_STORAGE_KEY = 'twitter-bookmarks.mock-imported.v1'
const MOCK_TAGS_STORAGE_KEY = 'twitter-bookmarks.mock-tags.v1'
const MOCK_BOOKMARK_TAGS_STORAGE_KEY = 'twitter-bookmarks.mock-bookmark-tags.v1'

const rawMockBookmarks = [
  {
    tweet: {
      id: '1775925658427793889',
      created_at: '2024-04-04T11:37:00Z',
      full_text: "We're improving the pricing of our infrastructure products:\n\n◆ Pay exactly for what you use, in granular increments\n◆ Lower prices for essentials (bandwidth & functions)\n◆ New primitives for easier spend optimization\n◆ Our hobby tier remains free\nhttps://t.co/VHfHzU3dGG",
      user: {
        id: '100001',
        name: 'Vercel',
        screen_name: 'vercel',
        profile_image_url_https: 'https://unavatar.io/x/vercel'
      },
      favorite_count: 664,
      retweet_count: 128,
      entities: {
        urls: [
          { url: 'https://t.co/VHfHzU3dGG', expanded_url: 'https://x.com/vercel/status/1775925658427793889' },
          { url: 'https://vercel.com', expanded_url: 'https://vercel.com' }
        ]
      }
    }
  },
  {
    tweet: {
      id: '1735719381739454730',
      created_at: '2023-12-15T12:52:00Z',
      full_text: 'v0 is now open for everyone.\n\nGenerate UI in seconds with text or images.\nhttps://t.co/nojFCpeGx1',
      user: {
        id: '100001',
        name: 'Vercel',
        screen_name: 'vercel',
        profile_image_url_https: 'https://unavatar.io/x/vercel'
      },
      favorite_count: 3600,
      retweet_count: 742,
      entities: {
        urls: [
          { url: 'https://t.co/nojFCpeGx1', expanded_url: 'https://x.com/vercel/status/1735719381739454730' },
          { url: 'https://v0.dev', expanded_url: 'https://v0.dev' }
        ]
      }
    }
  },
  {
    tweet: {
      id: '2027062351724527723',
      created_at: '2026-02-26T11:45:00Z',
      full_text: 'Introducing a code → design → code workflow in Codex ✨\n\nCollaborate in Figma directly from your coding environment — without ever breaking your implementation flow.',
      user: {
        id: '100002',
        name: 'OpenAI Developers',
        screen_name: 'OpenAIDevs',
        profile_image_url_https: 'https://unavatar.io/x/OpenAIDevs'
      },
      favorite_count: 1000,
      retweet_count: 208,
      entities: {
        urls: [
          { url: 'https://t.co/OXdfoy5mXS', expanded_url: 'https://x.com/OpenAIDevs/status/2027062351724527723' },
          { url: 'https://developers.openai.com', expanded_url: 'https://developers.openai.com' }
        ]
      }
    }
  },
  {
    tweet: {
      id: '2001419753722909149',
      created_at: '2025-12-17T17:30:00Z',
      full_text: 'Apps in ChatGPT are powered by the Apps SDK (now in beta).\n\nNew resources include:\n• Open-source example apps\n• An open-source UI library for chat-native interfaces\n• A quickstart guide with step-by-step instructions\nhttps://t.co/pj4gUgso22',
      user: {
        id: '100002',
        name: 'OpenAI Developers',
        screen_name: 'OpenAIDevs',
        profile_image_url_https: 'https://unavatar.io/x/OpenAIDevs'
      },
      favorite_count: 93,
      retweet_count: 4,
      entities: {
        urls: [
          { url: 'https://t.co/pj4gUgso22', expanded_url: 'https://x.com/OpenAIDevs/status/2001419753722909149' },
          { url: 'https://developers.openai.com/apps-sdk', expanded_url: 'https://developers.openai.com/apps-sdk' }
        ]
      }
    }
  },
  {
    tweet: {
      id: '1950240351547248941',
      created_at: '2025-07-29T13:01:00Z',
      full_text: "Built in collaboration with educators and experts, study mode is our first step toward improving learning in ChatGPT.\n\nEducation is a key AI frontier, and through NextGenAI and Stanford's SCALE Initiative, we're running longer term studies to further understand how AI tools shape…",
      user: {
        id: '100003',
        name: 'OpenAI',
        screen_name: 'OpenAI',
        profile_image_url_https: 'https://unavatar.io/x/OpenAI'
      },
      favorite_count: 1000,
      retweet_count: 61,
      entities: {
        urls: [{ url: 'https://x.com/OpenAI/status/1950240351547248941', expanded_url: 'https://x.com/OpenAI/status/1950240351547248941' }]
      }
    }
  },
  {
    tweet: {
      id: '1894583079404277864',
      created_at: '2025-02-25T20:59:00Z',
      full_text: 'Rollout complete ✅ https://t.co/8yQgDJEPBc',
      user: {
        id: '100003',
        name: 'OpenAI',
        screen_name: 'OpenAI',
        profile_image_url_https: 'https://unavatar.io/x/OpenAI'
      },
      favorite_count: 4300,
      retweet_count: 263,
      extended_entities: {
        media: [{ media_url_https: 'https://placehold.co/1200x675/png?text=OpenAI+Deep+Research' }]
      },
      entities: {
        urls: [{ url: 'https://x.com/OpenAI/status/1894583079404277864', expanded_url: 'https://x.com/OpenAI/status/1894583079404277864' }]
      }
    }
  },
  {
    tweet: {
      id: '1894107752479252541',
      created_at: '2025-02-24T14:30:00Z',
      full_text: "Claude's extended thinking mode gives it an impressive boost in intelligence to tackle difficult problems.\n\nDevelopers can even set a \"thinking budget\" to control precisely how long Claude spends on a problem.",
      user: {
        id: '100004',
        name: 'Anthropic',
        screen_name: 'AnthropicAI',
        profile_image_url_https: 'https://unavatar.io/x/AnthropicAI'
      },
      favorite_count: 135,
      retweet_count: 4,
      entities: {
        urls: [{ url: 'https://x.com/AnthropicAI/status/1894107752479252541', expanded_url: 'https://x.com/AnthropicAI/status/1894107752479252541' }]
      }
    }
  },
  {
    tweet: {
      id: '1846194917720088721',
      created_at: '2024-10-15T10:22:00Z',
      full_text: "We've published a significant update to our Responsible Scaling Policy, which matches safety and security measures to an AI model's capabilities. \n\nRead more here: https://t.co/bBc8YaF3j9",
      user: {
        id: '100004',
        name: 'Anthropic',
        screen_name: 'AnthropicAI',
        profile_image_url_https: 'https://unavatar.io/x/AnthropicAI'
      },
      favorite_count: 923,
      retweet_count: 206,
      entities: {
        urls: [
          { url: 'https://t.co/bBc8YaF3j9', expanded_url: 'https://x.com/AnthropicAI/status/1846194917720088721' },
          { url: 'https://www.anthropic.com', expanded_url: 'https://www.anthropic.com' }
        ]
      }
    }
  },
  {
    tweet: {
      id: '1775154908527784236',
      created_at: '2024-04-02T06:34:00Z',
      full_text: 'Introducing Cloudflare Workers in Python, now in open beta! We\'ve revamped our systems to support Python, from the runtime to deployment. Learn about Python Worker\'s lifecycle, dynamic linking, and memory snapshots in this post. https://t.co/R3a6bLKlSd #DeveloperWeek',
      user: {
        id: '100005',
        name: 'Cloudflare',
        screen_name: 'Cloudflare',
        profile_image_url_https: 'https://unavatar.io/x/Cloudflare'
      },
      favorite_count: 291,
      retweet_count: 67,
      entities: {
        urls: [
          { url: 'https://t.co/R3a6bLKlSd', expanded_url: 'https://x.com/Cloudflare/status/1775154908527784236' },
          { url: 'https://developers.cloudflare.com/workers/', expanded_url: 'https://developers.cloudflare.com/workers/' }
        ]
      }
    }
  },
  {
    tweet: {
      id: '1962927193203281981',
      created_at: '2025-09-02T12:14:00Z',
      full_text: 'A recent security issue announced by Salesloft has impacted many companies, including Cloudflare. This post provides a timeline of the attack, details our response, and offers security recommendations to help other organizations mitigate the effects of this attack.…',
      user: {
        id: '100005',
        name: 'Cloudflare',
        screen_name: 'Cloudflare',
        profile_image_url_https: 'https://unavatar.io/x/Cloudflare'
      },
      favorite_count: 0,
      retweet_count: 0,
      entities: {
        urls: [{ url: 'https://x.com/Cloudflare/status/1962927193203281981', expanded_url: 'https://x.com/Cloudflare/status/1962927193203281981' }]
      }
    }
  },
  {
    tweet: {
      id: '1910317775244911063',
      created_at: '2025-04-10T09:03:00Z',
      full_text: 'Super Slurper just got 5x faster! 🚀\n(Try saying that three times fast.)\n\nMigrate data from S3, Google Cloud Storage, or any S3-compatible storage straight to Cloudflare R2 -- now in 1/5 the time.\n\nLink in 🧵 showing how we built it using Workers, Durable Objects, and Queues.…',
      user: {
        id: '100006',
        name: 'Cloudflare Developers',
        screen_name: 'CloudflareDev',
        profile_image_url_https: 'https://unavatar.io/x/CloudflareDev'
      },
      favorite_count: 155,
      retweet_count: 11,
      extended_entities: {
        media: [{ media_url_https: 'https://cf-assets.www.cloudflare.com/zkvhlag99gkb/6DndD4zbnsrwlVNmu7qH6N/41285e2458613700ed7054045c9ab620/OG_Share_2024__37_.png' }]
      },
      entities: {
        urls: [
          { url: 'https://x.com/CloudflareDev/status/1910317775244911063', expanded_url: 'https://x.com/CloudflareDev/status/1910317775244911063' },
          { url: 'https://blog.cloudflare.com', expanded_url: 'https://blog.cloudflare.com' }
        ]
      }
    }
  },
  {
    tweet: {
      id: '2023827897627377783',
      created_at: '2026-02-17T13:32:00Z',
      full_text: 'Cursor now integrates with the Cloudflare developer platform 🤝\n\nBuild MCP servers and manage Workers directly from the plugin — without ever leaving your editor.',
      user: {
        id: '100007',
        name: 'Cursor',
        screen_name: 'cursor_ai',
        profile_image_url_https: 'https://unavatar.io/x/cursor_ai'
      },
      favorite_count: 93,
      retweet_count: 9,
      entities: {
        urls: [{ url: 'https://x.com/cursor_ai/status/2023827897627377783', expanded_url: 'https://x.com/cursor_ai/status/2023827897627377783' }]
      }
    }
  },
  {
    tweet: {
      id: '1921753445624664163',
      created_at: '2025-05-11T22:25:00Z',
      full_text: 'Alert fatigue is real. 😔 Drowning in Dependabot notifications? Good news! Dependabot now helps prioritize security alerts based on actual risk, cutting through the noise. 🙏\n\nFocus your efforts on the vulnerabilities that truly matter. Learn how to use these prioritization…',
      user: {
        id: '100008',
        name: 'GitHub',
        screen_name: 'github',
        profile_image_url_https: 'https://unavatar.io/x/github'
      },
      favorite_count: 119,
      retweet_count: 18,
      extended_entities: {
        media: [{ media_url_https: 'https://github.blog/wp-content/uploads/2024/02/Security-DarkMode-2-2.png?resize=1200%2C630' }]
      },
      entities: {
        urls: [{ url: 'https://x.com/github/status/1921753445624664163', expanded_url: 'https://x.com/github/status/1921753445624664163' }]
      }
    }
  },
  {
    tweet: {
      id: '2026072088952316238',
      created_at: '2026-02-23T15:10:00Z',
      full_text: 'We are investigating elevated latency and timeouts affecting code search. An impacted shard has been identified and the team is actively mitigating. We will provide updates as we have more information.\n\nhttps://githubstatus.com',
      user: {
        id: '100009',
        name: 'GitHub Status',
        screen_name: 'githubstatus',
        profile_image_url_https: 'https://unavatar.io/x/githubstatus'
      },
      favorite_count: 0,
      retweet_count: 0,
      entities: {
        urls: [
          { url: 'https://x.com/githubstatus/status/2026072088952316238', expanded_url: 'https://x.com/githubstatus/status/2026072088952316238' },
          { url: 'https://www.githubstatus.com', expanded_url: 'https://www.githubstatus.com' }
        ]
      }
    }
  },
  {
    tweet: {
      id: '2025947915261194477',
      created_at: '2026-02-23T09:56:00Z',
      full_text: 'We are investigating degraded availability of the Claude Haiku 4.5 model in Copilot Chat, VS Code, and other Copilot products. This is caused by an issue with an upstream provider.\n\nhttps://githubstatus.com',
      user: {
        id: '100009',
        name: 'GitHub Status',
        screen_name: 'githubstatus',
        profile_image_url_https: 'https://unavatar.io/x/githubstatus'
      },
      favorite_count: 4,
      retweet_count: 0,
      entities: {
        urls: [
          { url: 'https://x.com/githubstatus/status/2025947915261194477', expanded_url: 'https://x.com/githubstatus/status/2025947915261194477' },
          { url: 'https://www.githubstatus.com', expanded_url: 'https://www.githubstatus.com' }
        ]
      }
    }
  },
  {
    tweet: {
      id: '1965770108178931833',
      created_at: '2025-09-10T09:31:00Z',
      full_text: 'Actions hosted runners are taking longer to come online, leading to high wait times or job failures. https://t.co/dSTeFm4CCS',
      user: {
        id: '100009',
        name: 'GitHub Status',
        screen_name: 'githubstatus',
        profile_image_url_https: 'https://unavatar.io/x/githubstatus'
      },
      favorite_count: 6,
      retweet_count: 1,
      entities: {
        urls: [
          { url: 'https://x.com/githubstatus/status/1965770108178931833', expanded_url: 'https://x.com/githubstatus/status/1965770108178931833' },
          { url: 'https://www.githubstatus.com', expanded_url: 'https://www.githubstatus.com' }
        ]
      }
    }
  },
  {
    tweet: {
      id: '2026043597653438700',
      created_at: '2026-02-23T15:16:00Z',
      full_text: 'We are investigating degraded performance affecting Issues and Pull Requests.\n\nhttps://githubstatus.com',
      user: {
        id: '100009',
        name: 'GitHub Status',
        screen_name: 'githubstatus',
        profile_image_url_https: 'https://unavatar.io/x/githubstatus'
      },
      favorite_count: 0,
      retweet_count: 0,
      entities: {
        urls: [
          { url: 'https://x.com/githubstatus/status/2026043597653438700', expanded_url: 'https://x.com/githubstatus/status/2026043597653438700' },
          { url: 'https://www.githubstatus.com', expanded_url: 'https://www.githubstatus.com' }
        ]
      }
    }
  },
  {
    tweet: {
      id: '2026698251278143922',
      created_at: '2026-02-25T09:38:00Z',
      full_text: 'We are investigating a degradation affecting Copilot.\n\nhttps://githubstatus.com',
      user: {
        id: '100009',
        name: 'GitHub Status',
        screen_name: 'githubstatus',
        profile_image_url_https: 'https://unavatar.io/x/githubstatus'
      },
      favorite_count: 0,
      retweet_count: 0,
      entities: {
        urls: [
          { url: 'https://x.com/githubstatus/status/2026698251278143922', expanded_url: 'https://x.com/githubstatus/status/2026698251278143922' },
          { url: 'https://www.githubstatus.com', expanded_url: 'https://www.githubstatus.com' }
        ]
      }
    }
  },
  {
    tweet: {
      id: '1631540920775593985',
      created_at: '2023-03-03T00:24:00Z',
      full_text: 'The @nextjs Subscription Payments @vercel starter template just got a major dependency lift thanks to the awesome @nezdemkovski 💚\n\nCheck it out 👉 https://t.co/Qrrn2U8SJL',
      user: {
        id: '100010',
        name: 'Supabase',
        screen_name: 'supabase',
        profile_image_url_https: 'https://unavatar.io/x/supabase'
      },
      favorite_count: 0,
      retweet_count: 0,
      extended_entities: {
        media: [{ media_url_https: 'https://opengraph.githubassets.com/fc90c4ca4f327c7a0a1e8f6430c3aff064021d1f17e9a9e4e47d7ecc2d09532c/vercel/nextjs-subscription-payments/pull/171' }]
      },
      entities: {
        urls: [
          { url: 'https://x.com/supabase/status/1631540920775593985', expanded_url: 'https://x.com/supabase/status/1631540920775593985' },
          { url: 'https://github.com/vercel/nextjs-subscription-payments/pull/171', expanded_url: 'https://github.com/vercel/nextjs-subscription-payments/pull/171' }
        ]
      }
    }
  },
  {
    tweet: {
      id: '2026580588527043052',
      created_at: '2026-02-25T00:50:00Z',
      full_text: 'We deployed a Vinext app in under 5 minutes 👀\nThe Vite-based "drop-in" Next.js replacement announced by @Cloudflare.\nWe tested it outside Workers: Node/Bun app, push to Clever Cloud. We even used an AI to generate and deploy the example.\nFull story 👉 https://clever.cloud/blog/engineering/2026/02/25/how-we-deployed-a-vinext-application/',
      user: {
        id: '100011',
        name: 'Clever Cloud',
        screen_name: 'clever_cloud',
        profile_image_url_https: 'https://unavatar.io/x/clever_cloud'
      },
      favorite_count: 17,
      retweet_count: 5,
      extended_entities: {
        media: [{ media_url_https: 'https://cdn.clever-cloud.com/uploads/2026/02/2026-02-25-clever-cloud-banniere-blog-vinext-en.png' }]
      },
      entities: {
        urls: [
          { url: 'https://x.com/clever_cloud/status/2026580588527043052', expanded_url: 'https://x.com/clever_cloud/status/2026580588527043052' },
          { url: 'https://www.clever.cloud/blog/engineering/2026/02/25/how-we-deployed-a-vinext-application/', expanded_url: 'https://www.clever.cloud/blog/engineering/2026/02/25/how-we-deployed-a-vinext-application/' }
        ]
      }
    }
  },
  {
    tweet: {
      id: '2026421496374345892',
      created_at: '2026-02-24T17:18:00Z',
      full_text: 'This is insane. Next.js rebuilt based on Vite, and it only took one week and $1,100 in tokens?!?!\n\nCode really doesn\'t matter anymore. Crazy.',
      user: {
        id: '100012',
        name: 'Max Stoiber',
        screen_name: 'mxstbr',
        profile_image_url_https: 'https://unavatar.io/x/mxstbr'
      },
      favorite_count: 3800,
      retweet_count: 157,
      quoted_tweet: {
        author_name: 'Cloudflare',
        author_handle: 'Cloudflare',
        author_avatar_url: 'https://unavatar.io/x/Cloudflare',
        created_at: '2026-02-24T10:00:00Z',
        full_text: 'We rebuilt Next.js in a week. No, really.\n\nThe team ported the framework to run natively on Workers to prove what\'s possible with edge-first architecture. Dive into the technical hurdles we solved to eliminate Node.js dependencies.'
      },
      entities: {
        urls: [
          { url: 'https://x.com/mxstbr/status/2026421496374345892', expanded_url: 'https://x.com/mxstbr/status/2026421496374345892' },
          { url: 'https://blog.cloudflare.com', expanded_url: 'https://blog.cloudflare.com' }
        ]
      }
    }
  }
]

function transformBookmark(item, index) {
  const tweet = item.tweet

  return {
    id: tweet.id,
    tweet_url: `https://twitter.com/${tweet.user?.screen_name}/status/${tweet.id}`,
    full_text: tweet.full_text || '',
    author_name: tweet.user?.name || 'Unknown',
    author_handle: tweet.user?.screen_name || 'unknown',
    author_avatar_url: tweet.user?.profile_image_url_https || null,
    created_at: tweet.created_at,
    imported_at: new Date().toISOString(),
    like_count: tweet.favorite_count || 0,
    retweet_count: tweet.retweet_count || 0,
    has_media: (tweet.extended_entities?.media?.length ?? 0) > 0,
    media_urls: tweet.extended_entities?.media?.map((media) => media.media_url_https) || null,
    urls: tweet.entities?.urls?.map((url) => ({ url: url.url, expanded_url: url.expanded_url })) || null,
    quoted_tweet: tweet.quoted_tweet || null,
    raw_json: tweet,
    is_favorite: index === 0 || index === 3 || index === 8,
    is_archived: index === 5 || index === 14,
    tags: []
  }
}

function loadStoredMockState() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {}
  }

  try {
    const rawValue = window.localStorage.getItem(MOCK_BOOKMARK_STATE_STORAGE_KEY)
    const parsedValue = rawValue ? JSON.parse(rawValue) : {}

    return parsedValue && typeof parsedValue === 'object' ? parsedValue : {}
  } catch {
    return {}
  }
}

function loadStoredImportedBookmarks() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return []
  }

  try {
    const rawValue = window.localStorage.getItem(MOCK_IMPORTED_BOOKMARKS_STORAGE_KEY)
    const parsedValue = rawValue ? JSON.parse(rawValue) : []
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    return []
  }
}

function persistMockState(bookmarks) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }

  const stateToPersist = Object.fromEntries(
    bookmarks.map((bookmark) => [
      bookmark.id,
      {
        is_favorite: Boolean(bookmark.is_favorite),
        is_archived: Boolean(bookmark.is_archived)
      }
    ])
  )

  window.localStorage.setItem(MOCK_BOOKMARK_STATE_STORAGE_KEY, JSON.stringify(stateToPersist))
}

function persistImportedBookmarks(bookmarks) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }

  const importedBookmarks = bookmarks.filter((bookmark) => bookmark.source === 'imported')
  window.localStorage.setItem(MOCK_IMPORTED_BOOKMARKS_STORAGE_KEY, JSON.stringify(importedBookmarks))
}

function loadStoredTags() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null
  }

  try {
    const rawValue = window.localStorage.getItem(MOCK_TAGS_STORAGE_KEY)
    return rawValue ? JSON.parse(rawValue) : null
  } catch {
    return null
  }
}

function loadStoredBookmarkTagMap() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null
  }

  try {
    const rawValue = window.localStorage.getItem(MOCK_BOOKMARK_TAGS_STORAGE_KEY)
    return rawValue ? JSON.parse(rawValue) : null
  } catch {
    return null
  }
}

const storedMockState = loadStoredMockState()
const storedImportedBookmarks = loadStoredImportedBookmarks()
const mockBookmarks = normalizeBookmarks(
  [
    ...rawMockBookmarks.map((item, index) => {
      const bookmark = transformBookmark(item, index)
      const storedState = storedMockState[bookmark.id]

      return storedState
        ? {
            ...bookmark,
            is_favorite: Boolean(storedState.is_favorite),
            is_archived: Boolean(storedState.is_archived)
          }
        : bookmark
    }),
    ...storedImportedBookmarks
  ].map((bookmark, index) => {
    if (bookmark.tweet) {
      return transformBookmark(bookmark, index)
    }

    const storedState = storedMockState[bookmark.id]

    return storedState
      ? {
          ...bookmark,
          is_favorite: Boolean(storedState.is_favorite),
          is_archived: Boolean(storedState.is_archived)
        }
      : bookmark
  })
)

function buildDefaultTagData(bookmarks) {
  const defaultTags = [
    { id: 1, name: 'AI', color: '#8b5cf6', created_at: '2026-03-01T09:00:00.000Z' },
    { id: 2, name: 'Infra', color: '#00e3fd', created_at: '2026-03-02T09:00:00.000Z' },
    { id: 3, name: 'Security', color: '#ff6e84', created_at: '2026-03-03T09:00:00.000Z' },
    { id: 4, name: 'UI Systems', color: '#ff5ed6', created_at: '2026-03-04T09:00:00.000Z' },
    { id: 5, name: 'Status', color: '#f59e0b', created_at: '2026-03-05T09:00:00.000Z' }
  ]
  const assignments = {}

  for (const bookmark of bookmarks) {
    const tagIds = new Set()
    const text = `${bookmark.full_text} ${(bookmark.author_name || '')} ${(bookmark.author_handle || '')}`.toLowerCase()

    if (/(openai|anthropic|claude|chatgpt|codex|copilot|cursor|ai)/.test(text)) {
      tagIds.add(1)
    }
    if (/(vercel|cloudflare|workers|runtime|deploy|infra|latency|node|vite)/.test(text)) {
      tagIds.add(2)
    }
    if (/(security|responsible scaling|vulnerabilit|dependabot|attack|incident)/.test(text)) {
      tagIds.add(3)
    }
    if (/(design|ui|figma|v0|interface|typography)/.test(text)) {
      tagIds.add(4)
    }
    if (/(status|degraded|investigating|outage|timeout)/.test(text) || bookmark.author_handle === 'githubstatus') {
      tagIds.add(5)
    }

    assignments[bookmark.id] = Array.from(tagIds)
  }

  return { tags: defaultTags, assignments }
}

const storedTags = loadStoredTags()
const storedBookmarkTagMap = loadStoredBookmarkTagMap()
const defaultTagData = buildDefaultTagData(mockBookmarks)
const mockTags = Array.isArray(storedTags) ? storedTags : defaultTagData.tags
const mockBookmarkTagMap = storedBookmarkTagMap && typeof storedBookmarkTagMap === 'object'
  ? storedBookmarkTagMap
  : defaultTagData.assignments

function persistMockTags() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }

  window.localStorage.setItem(MOCK_TAGS_STORAGE_KEY, JSON.stringify(mockTags))
  window.localStorage.setItem(MOCK_BOOKMARK_TAGS_STORAGE_KEY, JSON.stringify(mockBookmarkTagMap))
}

function hydrateBookmarkTags(bookmark) {
  const tagIds = mockBookmarkTagMap[bookmark.id] || []

  return {
    ...bookmark,
    tags: tagIds
      .map((tagId) => mockTags.find((tag) => tag.id === tagId))
      .filter(Boolean)
  }
}

function getTagUsageCount(tagId) {
  return Object.values(mockBookmarkTagMap).filter((tagIds) => Array.isArray(tagIds) && tagIds.includes(tagId)).length
}

function buildTagRecord(tag) {
  return {
    ...tag,
    count: getTagUsageCount(tag.id)
  }
}

function buildAuthorRecords() {
  const authorMap = new Map()

  mockBookmarks.forEach((bookmark) => {
    const handle = `${bookmark.author_handle || ''}`.trim()
    if (!handle) {
      return
    }

    const key = handle.toLowerCase()
    const current = authorMap.get(key)

    authorMap.set(key, {
      handle,
      name: bookmark.author_name || handle,
      count: (current?.count || 0) + 1
    })
  })

  return Array.from(authorMap.values()).sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count
    }

    return left.handle.localeCompare(right.handle, 'pt-BR')
  })
}

function createImportedBookmark(tweet) {
  const id = tweet.id
  const authorHandle = tweet.user?.screen_name || 'unknown'

  return {
    id,
    tweet_url: `https://twitter.com/${authorHandle}/status/${id}`,
    full_text: tweet.full_text || '',
    author_name: tweet.user?.name || 'Unknown',
    author_handle: authorHandle,
    author_avatar_url: tweet.user?.profile_image_url_https || null,
    created_at: tweet.created_at || new Date().toISOString(),
    imported_at: new Date().toISOString(),
    like_count: tweet.favorite_count || 0,
    retweet_count: tweet.retweet_count || 0,
    has_media: (tweet.extended_entities?.media?.length ?? 0) > 0,
    media_urls: tweet.extended_entities?.media?.map((media) => media.media_url_https) || null,
    urls: tweet.entities?.urls?.map((url) => ({ url: url.url, expanded_url: url.expanded_url })) || null,
    quoted_tweet: tweet.quoted_tweet || null,
    raw_json: tweet,
    is_favorite: false,
    is_archived: false,
    tags: [],
    source: 'imported'
  }
}

function persistMockBookmarks(bookmarks) {
  persistMockState(bookmarks)
  persistImportedBookmarks(bookmarks)
  persistMockTags()
}

function upsertImportedBookmarks(items) {
  const bookmarksById = new Map(mockBookmarks.map((bookmark) => [bookmark.id, bookmark]))
  let importedCount = 0

  for (const item of items) {
    if (!item?.tweet?.id || bookmarksById.has(item.tweet.id)) {
      continue
    }

    const bookmark = normalizeBookmarks([createImportedBookmark(item.tweet)])[0]
    mockBookmarks.unshift(bookmark)
    bookmarksById.set(bookmark.id, bookmark)
    importedCount += 1
  }

  persistMockBookmarks(mockBookmarks)
  return importedCount
}

function updateMockBookmark(id, updater) {
  const bookmark = mockBookmarks.find((item) => item.id === id)

  if (!bookmark) {
    return null
  }

  const updates = updater(bookmark)
  Object.assign(bookmark, updates)
  persistMockBookmarks(mockBookmarks)
  return bookmark
}

function filterBookmarks(filters = {}) {
  const requestedTags = [...new Set([filters.tag, ...(Array.isArray(filters.tags) ? filters.tags : [])].filter(Boolean))]
    .map((tag) => `${tag}`.toLowerCase())
  const requestedAuthors = [...new Set(Array.isArray(filters.authors) ? filters.authors : filters.author ? [filters.author] : [])]
    .map((author) => `${author}`.toLowerCase())
  const searchFilter = filters.search ? `${filters.search}`.toLowerCase() : ''
  const view = filters.view || 'all'

  let items = mockBookmarks.map(hydrateBookmarkTags)

  if (view === 'favorites') {
    items = items.filter((bookmark) => bookmark.is_favorite && !bookmark.is_archived)
  } else if (view === 'archived') {
    items = items.filter((bookmark) => bookmark.is_archived)
  } else {
    items = items.filter((bookmark) => !bookmark.is_archived)
  }

  if (requestedTags.length > 0) {
    items = items.filter((bookmark) =>
      requestedTags.every((requestedTag) =>
        (bookmark.tags || []).some((tag) => `${tag.name}`.toLowerCase() === requestedTag)
      )
    )
  }

  if (requestedAuthors.length > 0) {
    items = items.filter((bookmark) =>
      requestedAuthors.some((requestedAuthor) =>
        `${bookmark.author_handle}`.toLowerCase().includes(requestedAuthor) ||
        `${bookmark.author_name}`.toLowerCase().includes(requestedAuthor)
      )
    )
  }

  if (searchFilter) {
    items = items.filter((bookmark) =>
      [bookmark.full_text, bookmark.author_name, bookmark.author_handle]
        .filter(Boolean)
        .some((value) => `${value}`.toLowerCase().includes(searchFilter))
    )
  }

  return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

function paginateBookmarks(items, filters = {}) {
  const offset = Number.isFinite(Number(filters.offset)) ? Math.max(0, Number(filters.offset)) : 0
  const limit = Number.isFinite(Number(filters.limit)) ? Math.max(1, Number(filters.limit)) : items.length
  const pagedItems = items.slice(offset, offset + limit)

  return {
    items: pagedItems,
    total: items.length,
    offset,
    limit,
    hasMore: offset + pagedItems.length < items.length
  }
}

export const mockApi = {
  async getBookmarks(filters = {}) {
    const items = filterBookmarks(filters)
    return filters.offset !== undefined || filters.limit !== undefined
      ? paginateBookmarks(items, filters)
      : items
  },

  async getBookmarksWithTags(filters = {}) {
    const items = filterBookmarks(filters)
    return filters.offset !== undefined || filters.limit !== undefined
      ? paginateBookmarks(items, filters)
      : items
  },

  async getBookmarkById(id) {
    const bookmark = mockBookmarks.find((item) => item.id === id)
    return bookmark ? hydrateBookmarkTags(bookmark) : null
  },

  async setBookmarkFavorite(id, isFavorite) {
    const bookmark = updateMockBookmark(id, () => ({ is_favorite: Boolean(isFavorite) }))
    return bookmark || null
  },

  async setBookmarkArchived(id, isArchived) {
    const bookmark = updateMockBookmark(id, () => ({ is_archived: Boolean(isArchived) }))
    return bookmark || null
  },

  async deleteBookmark(id) {
    return { deleted: id }
  },

  async getAllTags() {
    return mockTags
      .map(buildTagRecord)
      .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'))
  },

  async getAllAuthors() {
    return buildAuthorRecords()
  },

  async createTag(name, color = '#6366f1') {
    if (!name || !name.trim()) {
      throw new Error('Nome da tag é obrigatório')
    }

    const normalizedName = name.trim().toLowerCase()

    if (mockTags.some((tag) => tag.name.trim().toLowerCase() === normalizedName)) {
      throw new Error('Já existe uma tag com esse nome')
    }

    const nextId = mockTags.reduce((max, tag) => Math.max(max, tag.id), 0) + 1
    const tag = {
      id: nextId,
      name: name.trim(),
      color,
      created_at: new Date().toISOString()
    }

    mockTags.push(tag)
    persistMockTags()
    return { lastInsertRowid: tag.id }
  },

  async updateTag(id, name, color) {
    const tag = mockTags.find((item) => item.id === id)

    if (!tag) {
      throw new Error('Tag não encontrada')
    }

    const normalizedName = name.trim().toLowerCase()
    if (mockTags.some((item) => item.id !== id && item.name.trim().toLowerCase() === normalizedName)) {
      throw new Error('Já existe outra tag com esse nome')
    }

    tag.name = name.trim()
    tag.color = color
    persistMockTags()
    return tag
  },

  async deleteTag(id) {
    const tagIndex = mockTags.findIndex((tag) => tag.id === id)

    if (tagIndex === -1) {
      throw new Error('Tag não encontrada')
    }

    mockTags.splice(tagIndex, 1)

    for (const bookmarkId of Object.keys(mockBookmarkTagMap)) {
      mockBookmarkTagMap[bookmarkId] = (mockBookmarkTagMap[bookmarkId] || []).filter((tagId) => tagId !== id)
    }

    persistMockTags()
    return { deleted: id }
  },

  async getBookmarkTags(bookmarkId) {
    return (mockBookmarkTagMap[bookmarkId] || [])
      .map((tagId) => mockTags.find((tag) => tag.id === tagId))
      .filter(Boolean)
  },

  async setBookmarkTags(bookmarkId, tagIds) {
    mockBookmarkTagMap[bookmarkId] = Array.from(new Set(tagIds))
    persistMockTags()
    return this.getBookmarkTags(bookmarkId)
  },

  async getNote() {
    return null
  },

  async upsertNote() {
    return null
  },

  async deleteNote() {
    return null
  },

  async importBookmarks(payload = {}) {
    const rawContent = typeof payload === 'string'
      ? payload
      : payload?.content

    if (!rawContent) {
      throw new Error('Nenhum arquivo foi selecionado para importação')
    }

    const data = parseTwitterBookmarksExport(rawContent)
    const imported = upsertImportedBookmarks(data)

    return {
      success: true,
      imported,
      message: imported > 0
        ? `${imported} bookmarks importados com sucesso`
        : 'Nenhum bookmark novo foi importado'
    }
  },

  async getStats() {
    return {
      bookmarksCount: mockBookmarks.length,
      favoritesCount: mockBookmarks.filter((bookmark) => bookmark.is_favorite && !bookmark.is_archived).length,
      archivedCount: mockBookmarks.filter((bookmark) => bookmark.is_archived).length,
      tagsCount: mockTags.length,
      notesCount: 0
    }
  }
}
