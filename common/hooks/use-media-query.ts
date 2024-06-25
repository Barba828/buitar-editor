import useMedia from "react-use/lib/useMedia"

export const isLightMode = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
  return mediaQuery.matches
}

export const useIsLightMode = () => {
  const isLight = useMedia('(prefers-color-scheme: light)');
  return isLight
}