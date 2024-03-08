import { HTMLProps, useCallback, useEffect, useRef, useState } from 'react'
import cx from 'classnames'

import './components.scss'

interface ListProp<T> extends HTMLProps<HTMLDivElement> {
  lists?: Array<T>
  renderItem?: (item: T, index: number) => JSX.Element
  onItemClick?: (item: T, index: number) => void
}

export function List<T>({
  children,
  lists,
  renderItem: propRenderItem,
  onItemClick,
  ...props
}: ListProp<T>) {
  const ref = useRef<HTMLDivElement>(null)
  const [checkedIndex, setCheckedIndex] = useState(0)

  const handleClickItem = useCallback(
    (item: T, index: number) => {
      onItemClick?.(item, index)
      setCheckedIndex(index)
    },
    [onItemClick]
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (lists?.length) {
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault()
            const prevIndex = checkedIndex >= lists.length - 1 ? 0 : checkedIndex + 1
            setCheckedIndex(prevIndex)
            break
          case 'ArrowUp':
            event.preventDefault()
            const nextIndex = checkedIndex <= 0 ? lists.length - 1 : checkedIndex - 1
            setCheckedIndex(nextIndex)
            break
          case 'Tab':
          case 'Enter':
            event.preventDefault()
            handleClickItem(lists[checkedIndex], checkedIndex)
            break
          case 'Escape':
            event.preventDefault()
            break
        }
      }
    },
    [checkedIndex, handleClickItem, lists]
  )

  /**容器内滚动 */
  useEffect(() => {
    if (!ref.current || !lists?.length) {
      return
    }
    const container = ref.current.parentElement || ref.current
    const checkedTarget = ref.current.children[checkedIndex]
    const { top, bottom } = container.getBoundingClientRect()
    const { top: targetTop, bottom: targetBottom } = checkedTarget.getBoundingClientRect()

    if (targetTop < top) {
      checkedTarget.scrollIntoView({
        block: 'start',
        inline: 'nearest',
        behavior: checkedIndex === 0 ? 'instant' : 'smooth',
      })
    } else if (targetBottom > bottom) {
      checkedTarget.scrollIntoView({
        block: 'end',
        inline: 'nearest',
        behavior: checkedIndex === lists.length - 1 ? 'instant' : 'smooth',
      })
    }
  }, [checkedIndex, lists])

  useEffect(() => {
    setCheckedIndex(0)
  }, [lists])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const renderItem = (item: T, index: number) => {
    return (
      <div
        key={index}
        onClick={() => handleClickItem(item, index)}
        onMouseEnter={() => setCheckedIndex(index)}
        className={cx('list-item', index === checkedIndex && 'list-item--active')}
        data-key={index}
      >
        {propRenderItem ? propRenderItem(item, index) : String(item)}
      </div>
    )
  }

  return (
    <div {...props} ref={ref} className="chord-list">
      {children}
      {lists?.map(renderItem)}
    </div>
  )
}
