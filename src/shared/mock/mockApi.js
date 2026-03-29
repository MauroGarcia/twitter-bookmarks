const rawMockBookmarks = [
  {
    tweet: {
      id: '1775925658427793889',
      created_at: '2024-04-04T11:37:00Z',
      full_text: 'Vercel detalha uma revisão de preços de infraestrutura com cobrança mais granular, custos menores para funções e bandwidth, e foco em otimização de gasto.',
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
      full_text: 'Vercel anuncia que o v0 foi aberto para todos, com geração de UI a partir de texto ou imagens em poucos segundos.',
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
      full_text: 'OpenAI Developers apresenta um fluxo de code to design to code, com colaboração em Figma dentro do Codex sem quebrar o fluxo de implementação.',
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
      full_text: 'OpenAI Developers divulga novidades do Apps SDK em beta, incluindo apps de exemplo open source, uma UI library para interfaces nativas de chat e um quickstart guiado.',
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
      full_text: 'OpenAI apresenta o study mode como um passo inicial para melhorar aprendizagem no ChatGPT em colaboração com educadores e pesquisadores.',
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
      full_text: 'OpenAI confirma o rollout do deep research para usuários Plus, Team, Edu e Enterprise do ChatGPT.',
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
      full_text: 'Anthropic descreve como o modo de extended thinking do Claude melhora o raciocínio em problemas difíceis e permite controlar o orçamento de pensamento.',
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
      full_text: 'Anthropic publica uma atualização relevante da Responsible Scaling Policy, ligando medidas de segurança às capacidades dos modelos.',
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
      full_text: 'Cloudflare lança Workers em Python em open beta e destaca mudanças no runtime, deploy, linking dinâmico e snapshots de memória.',
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
      full_text: 'Cloudflare relata impacto de um incidente de segurança ligado à Salesloft, com timeline, resposta do time e recomendações práticas para outras empresas.',
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
      full_text: 'Cloudflare Developers diz que o Super Slurper ficou 5x mais rápido para migrar dados de S3 e serviços compatíveis para o R2, usando Workers, Durable Objects e Queues.',
      user: {
        id: '100006',
        name: 'Cloudflare Developers',
        screen_name: 'CloudflareDev',
        profile_image_url_https: 'https://unavatar.io/x/CloudflareDev'
      },
      favorite_count: 155,
      retweet_count: 11,
      extended_entities: {
        media: [{ media_url_https: 'https://placehold.co/1200x675/png?text=Cloudflare+R2+Migration' }]
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
      full_text: 'Cursor anuncia integração com a plataforma de desenvolvedores da Cloudflare para construir servidores MCP e gerenciar Workers pelo plugin.',
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
      full_text: 'GitHub promove novos recursos do Dependabot para priorizar alertas de segurança com base em risco real e reduzir fadiga operacional.',
      user: {
        id: '100008',
        name: 'GitHub',
        screen_name: 'github',
        profile_image_url_https: 'https://unavatar.io/x/github'
      },
      favorite_count: 119,
      retweet_count: 18,
      extended_entities: {
        media: [{ media_url_https: 'https://placehold.co/1200x675/png?text=GitHub+Dependabot' }]
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
      full_text: 'GitHub Status informa latência elevada e timeouts na busca de código enquanto a equipe mitigava problemas em um shard afetado.',
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
      full_text: 'GitHub Status reporta indisponibilidade degradada do modelo Haiku 4.5 dentro do Copilot Chat, VS Code e outros produtos do Copilot por problema em provedor upstream.',
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
      full_text: 'GitHub Status avisa que runners hospedados do Actions estavam demorando a subir, causando filas longas e falhas de jobs.',
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
      full_text: 'GitHub Status comunica investigação de degradação em Issues e Pull Requests.',
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
      full_text: 'GitHub Status sinaliza investigação sobre degradação no Copilot.',
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
      full_text: 'Supabase destaca uma atualização grande no starter de Subscription Payments com Next.js e Vercel, incluindo dependências modernizadas.',
      user: {
        id: '100010',
        name: 'Supabase',
        screen_name: 'supabase',
        profile_image_url_https: 'https://unavatar.io/x/supabase'
      },
      favorite_count: 0,
      retweet_count: 0,
      extended_entities: {
        media: [{ media_url_https: 'https://placehold.co/1200x675/png?text=Supabase+Starter+Template' }]
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
      full_text: 'Clever Cloud mostra que conseguiu subir um app Vinext em menos de cinco minutos, testando o replacement baseado em Vite fora do Workers.',
      user: {
        id: '100011',
        name: 'Clever Cloud',
        screen_name: 'clever_cloud',
        profile_image_url_https: 'https://unavatar.io/x/clever_cloud'
      },
      favorite_count: 17,
      retweet_count: 5,
      extended_entities: {
        media: [{ media_url_https: 'https://placehold.co/1200x675/png?text=Vinext+on+Clever+Cloud' }]
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
      full_text: 'Max Stoiber reage ao experimento do Vinext e destaca o impacto de reconstruir uma experiência estilo Next.js sobre Vite em uma semana com baixo custo de tokens.',
      user: {
        id: '100012',
        name: 'Max Stoiber',
        screen_name: 'mxstbr',
        profile_image_url_https: 'https://unavatar.io/x/mxstbr'
      },
      favorite_count: 3800,
      retweet_count: 157,
      entities: {
        urls: [
          { url: 'https://x.com/mxstbr/status/2026421496374345892', expanded_url: 'https://x.com/mxstbr/status/2026421496374345892' },
          { url: 'https://blog.cloudflare.com', expanded_url: 'https://blog.cloudflare.com' }
        ]
      }
    }
  }
]

function transformBookmark(item) {
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
    raw_json: tweet,
    tags: []
  }
}

const mockBookmarks = rawMockBookmarks.map(transformBookmark)

function filterBookmarks(filters = {}) {
  const tagFilter = filters.tag ? `${filters.tag}`.toLowerCase() : ''
  const searchFilter = filters.search ? `${filters.search}`.toLowerCase() : ''

  let items = [...mockBookmarks]

  if (tagFilter) {
    items = items.filter((bookmark) =>
      (bookmark.tags || []).some((tag) => `${tag.name}`.toLowerCase() === tagFilter)
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

export const mockApi = {
  async getBookmarks(filters = {}) {
    return filterBookmarks(filters)
  },

  async getBookmarksWithTags(filters = {}) {
    return filterBookmarks(filters)
  },

  async getBookmarkById(id) {
    return mockBookmarks.find((bookmark) => bookmark.id === id) || null
  },

  async deleteBookmark(id) {
    return { deleted: id }
  },

  async getAllTags() {
    return []
  },

  async createTag() {
    throw new Error('Tag creation is not available in mock mode')
  },

  async updateTag() {
    throw new Error('Tag update is not available in mock mode')
  },

  async deleteTag() {
    throw new Error('Tag deletion is not available in mock mode')
  },

  async getBookmarkTags() {
    return []
  },

  async setBookmarkTags() {
    return []
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

  async importBookmarks() {
    throw new Error('Importação via arquivo não disponível na versão web')
  },

  async getStats() {
    return {
      bookmarksCount: mockBookmarks.length,
      tagsCount: 0,
      notesCount: 0
    }
  }
}
