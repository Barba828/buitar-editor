import { HTMLProps, LegacyRef, forwardRef, useCallback, useEffect, useState } from 'react'
import { Portal } from './index'
import cx from 'classnames'

import './components.scss'

declare module 'react' {
  function forwardRef<T, P = unknown>(
    render: (props: P, ref: React.Ref<T>) => React.ReactNode | null
  ): (props: P & React.RefAttributes<T>) => React.ReactNode | null
}

interface PopoverProp<T> extends HTMLProps<HTMLDivElement> {
  lists?: Array<T>
  renderItem?: (item: T, index: number) => JSX.Element
  onItemClick?: (item: T, index: number) => void
}

function ListInner<T>(
  { children, lists, renderItem: propRenderItem, onItemClick, ...props }: PopoverProp<T>,
  ref?: LegacyRef<HTMLDivElement>
) {
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
        className={cx('popover-item', index === checkedIndex && 'popover-item-active')}
        data-key={index}
      >
        {propRenderItem ? propRenderItem(item, index) : String(item)}
      </div>
    )
  }
  const renderElement = () => {
    return <>{lists?.map((it, i) => renderItem(it, i))}</>
  }

  return (
    <Portal>
      <div ref={ref} className="popover-container" {...props} tabIndex={0}>
        {children ? children : renderElement()}
      </div>
    </Portal>
  )
}

export const PopoverList = forwardRef(ListInner)

export const popoverListShow = (
  popEl: HTMLElement,
  triggerRect: {
    left: number
    right: number
    top: number
    bottom: number
  }
) => {
  const { left, right, top, bottom } = triggerRect
  const { width, height } = popEl.getBoundingClientRect()

  if (left + width < window.innerWidth) {
    popEl.style.left = `${left + window.scrollX}px`
    popEl.style.right = 'unset'
  } else {
    popEl.style.right = `${window.innerWidth - right - window.scrollX}px`
    popEl.style.left = 'unset'
  }
  if (bottom + height < window.innerHeight) {
    popEl.style.top = `${bottom + window.scrollY}px`
    popEl.style.bottom = 'unset'
  } else {
    popEl.style.bottom = `${window.innerHeight - top - window.scrollY}px`
    popEl.style.top = 'unset'
  }
}
