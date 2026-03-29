import { useState, useEffect } from 'react'

export function useDebounce(value, delayMs = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Delay de delayMs antes de atualizar
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delayMs)

    // Cleanup: cancelar timeout se value mudar antes do delay
    return () => clearTimeout(handler)
  }, [value, delayMs])

  return debouncedValue
}
