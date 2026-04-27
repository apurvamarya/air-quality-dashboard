/**
 * SECTION 6 — PERFORMANCE: useDebounce
 * Delays updating the returned value until `delay` ms have passed
 * since the last change. Used to prevent excessive API calls.
 */
import { useState, useEffect } from 'react'

export default function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
