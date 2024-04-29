import { HTMLProps, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import cx from 'classnames'

import './list.scss'

interface ListProp<T> extends HTMLProps<HTMLDivElement> {
  lists?: Array<T>
  nestedLists?: Array<{ list: T[]; title?: string }>
  renderItem?: (item: T, index: number) => JSX.Element
  onItemClick?: (item: T, index: number) => void
}

export function List<T>({
  children,
  nestedLists,
  lists,
  renderItem: propRenderItem,
  onItemClick,
  ...props
}: ListProp<T>) {
  const ref = useRef<HTMLDivElement>(null)
  const [checkedIndex, setCheckedIndex] = useState(0)
  const flatList = useMemo<T[]>(() => {
    if (nestedLists?.length) {
      return nestedLists.reduce((prev, item) => [...prev, ...item.list], [] as T[])
    } else if (lists?.length) {
      return lists
    }
    return []
  }, [nestedLists, lists])

  const handleClickItem = useCallback(
    (item: T, index: number) => {
      setCheckedIndex(index)
      onItemClick?.(item, index)
    },
    [onItemClick]
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (flatList.length) {
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault()
            const prevIndex = checkedIndex >= flatList.length - 1 ? 0 : checkedIndex + 1
            setCheckedIndex(prevIndex)
            break
          case 'ArrowUp':
            event.preventDefault()
            const nextIndex = checkedIndex <= 0 ? flatList.length - 1 : checkedIndex - 1
            setCheckedIndex(nextIndex)
            break
          case 'Tab':
          case 'Enter':
            event.preventDefault()
            onItemClick?.(flatList[checkedIndex], checkedIndex)
            break
          case 'Escape':
            event.preventDefault()
            break
        }
      }
    },
    [checkedIndex, flatList, onItemClick]
  )

  /**容器内滚动 */
  useEffect(() => {
    if (!ref.current || !flatList.length) {
      return
    }
    const container = ref.current.parentElement || ref.current
    const checkedTarget = ref.current.querySelector(`.chord-list-item[data-key="${checkedIndex}"]`)

    if (!container || !checkedTarget) {
      return
    }

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
        behavior: checkedIndex === flatList.length - 1 ? 'instant' : 'smooth',
      })
    }
  }, [checkedIndex, flatList])

  useEffect(() => {
    setCheckedIndex(0)
  }, [lists])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  /**列表项 */
  const renderItem = (item: T, index: number) => {
    return (
      <div
        key={index}
        onMouseDown={(e) => {
          e.preventDefault()
          handleClickItem(item, index)
        }}
        onMouseMove={() => {
          ref.current?.focus()
          setCheckedIndex(index)
        }}
        className={cx('chord-list-item', index === checkedIndex && 'chord-list-item--active')}
        data-key={index}
      >
        {propRenderItem ? propRenderItem(item, index) : String(item)}
      </div>
    )
  }

  let offset = 0
  /**嵌套列表 */
  const renderNestedItem = (item: { list: T[]; title?: string }, index: number) => {
    const { list, title } = item
    offset += index > 0 && nestedLists ? nestedLists?.[index - 1].list.length : 0
    return (
      <div className="chord-list__nested" key={`nested-${index}`}>
        {title && <div className="chord-list__nested-title">{title}</div>}
        {list.map((it, idx) => renderItem(it, idx + offset))}
      </div>
    )
  }

  return (
    <div {...props} ref={ref} className="chord-list">
      {children}
      {nestedLists?.length ? nestedLists.map(renderNestedItem) : lists?.map(renderItem)}
    </div>
  )
}
