export function parseTwitterBookmarksExport(rawContent) {
  if (typeof rawContent !== 'string' || !rawContent.trim()) {
    throw new Error('Arquivo vazio ou inválido')
  }

  const jsonStr = rawContent.replace(/^window\.YTD\.bookmarks\.part\d+ = /, '').trim()

  let data
  try {
    data = JSON.parse(jsonStr)
  } catch (error) {
    throw new Error(`Erro ao fazer parse do JSON: ${error.message}`)
  }

  if (!Array.isArray(data)) {
    throw new Error('Formato de arquivo inválido')
  }

  return data
}
