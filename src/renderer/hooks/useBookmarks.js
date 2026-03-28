import { useEffect } from 'react'
import { useAppStore } from '../store/appStore'

export function useBookmarks() {
  const { bookmarks, loadBookmarks, selectedTag, searchQuery } = useAppStore()

  useEffect(() => {
    loadBookmarks({
      tag: selectedTag,
      search: searchQuery
    })
  }, [selectedTag, searchQuery])

  return { bookmarks, loadBookmarks }
}
