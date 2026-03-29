import { useEffect } from 'react'
import { useAppStore } from '../store/appStore'

export function useBookmarks() {
  const { bookmarks, loadBookmarks } = useAppStore((state) => ({
    bookmarks: state.bookmarks,
    loadBookmarks: state.loadBookmarks
  }))

  return { bookmarks, loadBookmarks }
}
