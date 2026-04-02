import { useEffect } from 'react'
import { useAppStore } from '../store/appStore'

export function useTags() {
  const { tags, loadTags } = useAppStore()

  useEffect(() => {
    loadTags()
  }, [loadTags])

  return { tags, loadTags }
}
