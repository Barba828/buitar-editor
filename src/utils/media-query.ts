export const isLightMode = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
  return mediaQuery.matches
}
