import { useState, useCallback } from 'react'

export default function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return initialValue
      return JSON.parse(item) as T
    } catch (e) {
      console.warn(`[useLocalStorage] Failed to read key "${key}":`, e)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStored(prev => {
      const next = value instanceof Function ? value(prev) : value
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch (e) {
        console.warn(`[useLocalStorage] Failed to write key "${key}":`, e)
      }
      return next
    })
  }, [key])

  return [stored, setValue]
}
