import { useState, useEffect } from "react"

export const isLightMode = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
  return mediaQuery.matches
}

export const useIsLightMode = () => {
  const [isLight, setIsLight] = useState(isLightMode())
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
    const listener = () => {
      setIsLight(mediaQuery.matches)
    }
    mediaQuery.addEventListener('change', listener)
    return () => {
      mediaQuery.removeEventListener('change', listener)
    }
  }, [])
  return isLight
}