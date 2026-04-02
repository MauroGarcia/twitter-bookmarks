import { expect, test } from '@playwright/test'

const workflowCardText = 'Introducing a code → design → code workflow in Codex'
const appsSdkCardText = 'Apps in ChatGPT are powered by the Apps SDK'
const vercelCardText = "We're improving the pricing of our infrastructure products"
const oldestActiveCardText = 'v0 is now open for everyone.'

function getBookmarkCard(page, text) {
  return page.locator('article').filter({ hasText: text })
}

async function openApp(page) {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Recent Bookmarks' })).toBeVisible()
  await expect(getBookmarkCard(page, workflowCardText)).toBeVisible()
}

function getViewTabs(page) {
  return page.locator('header nav')
}

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    window.localStorage.clear()
  })
})

test('filters bookmarks with author and tag suggestions', async ({ page }) => {
  await openApp(page)

  const searchInput = page.getByPlaceholder('Pesquisar bookmarks, autores ou tags...')

  await test.step('filter by author suggestion', async () => {
    await searchInput.fill('@Open')
    await page.getByRole('button', { name: /@OpenAIDevs/i }).click()

    await expect(page.getByLabel('Remover autor OpenAIDevs')).toBeVisible()
    await expect(getBookmarkCard(page, workflowCardText)).toBeVisible()
    await expect(getBookmarkCard(page, appsSdkCardText)).toBeVisible()
    await expect(getBookmarkCard(page, vercelCardText)).toHaveCount(0)
  })

  await test.step('refine with tag suggestion', async () => {
    await searchInput.fill('#AI')
    await page.getByRole('button', { name: /^#AI/i }).click()

    await expect(page.getByLabel('Remover tag AI')).toBeVisible()
    await expect(getBookmarkCard(page, workflowCardText)).toBeVisible()
    await expect(getBookmarkCard(page, appsSdkCardText)).toBeVisible()
    await expect(getBookmarkCard(page, vercelCardText)).toHaveCount(0)
  })
})

test('filters bookmarks by typing an @author handle directly', async ({ page }) => {
  await openApp(page)

  const searchInput = page.getByPlaceholder('Pesquisar bookmarks, autores ou tags...')

  await searchInput.fill('@OpenAIDevs')

  await expect(getBookmarkCard(page, workflowCardText)).toBeVisible()
  await expect(getBookmarkCard(page, appsSdkCardText)).toBeVisible()
  await expect(getBookmarkCard(page, vercelCardText)).toHaveCount(0)
})

test('moves a bookmark from active results to favorites and archived', async ({ page }) => {
  await openApp(page)

  const searchInput = page.getByPlaceholder('Pesquisar bookmarks, autores ou tags...')
  const workflowCard = getBookmarkCard(page, workflowCardText)

  await test.step('narrow down to one bookmark and favorite it', async () => {
    await searchInput.fill('workflow')

    await expect(workflowCard).toBeVisible()
    await expect(getBookmarkCard(page, appsSdkCardText)).toHaveCount(0)

    await workflowCard.getByTitle('Adicionar aos favoritos').click()
    await getViewTabs(page).getByRole('button', { name: 'Favoritos', exact: true }).click()

    await expect(page.getByRole('heading', { name: 'Favorite Bookmarks' })).toBeVisible()
    await expect(workflowCard).toBeVisible()
    await expect(getBookmarkCard(page, appsSdkCardText)).toHaveCount(0)
  })

  await test.step('archive it from favorites and verify archived view', async () => {
    await workflowCard.getByRole('button', { name: 'Arquivar' }).click()

    await expect(page.getByText('Nenhum favorito ainda')).toBeVisible()

    await getViewTabs(page).getByRole('button', { name: 'Arquivados', exact: true }).click()

    await expect(page.getByRole('heading', { name: 'Archived Bookmarks' })).toBeVisible()
    await expect(workflowCard).toBeVisible()
    await expect(getBookmarkCard(page, appsSdkCardText)).toHaveCount(0)
  })
})

test('loads the next bookmark batch while scrolling the all view', async ({ page }) => {
  await openApp(page)

  await expect(getBookmarkCard(page, oldestActiveCardText)).toHaveCount(0)

  const scrollRegion = page.locator('main > div.overflow-y-auto')
  await scrollRegion.evaluate((element) => {
    element.scrollTo({ top: element.scrollHeight, behavior: 'auto' })
  })

  await expect(getBookmarkCard(page, oldestActiveCardText)).toBeVisible()
})
