function debounce<T extends unknown[]>(func: (...args: T) => void, delay: number) {
  let timeoutId: NodeJS.Timeout

  return (...args: T) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

function throttle<T extends unknown[]>(func: (...args: T) => void, interval: number) {
  let shouldCall = true

  return (...args: T) => {
    if (shouldCall) {
      func(...args)
      shouldCall = false
      setTimeout(() => {
        shouldCall = true
      }, interval)
    }
  }
}

export { debounce, throttle }
