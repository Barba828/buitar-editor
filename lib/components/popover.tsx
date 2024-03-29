import { HTMLProps, LegacyRef, forwardRef, useImperativeHandle, useRef } from 'react'
import { Portal } from './portal'
import cx from 'classnames'
import './components.scss'

// declare module 'react' {
//   function forwardRef<T, P = unknown>(
//     render: (props: P, ref: React.Ref<T>) => React.ReactNode | null
//   ): (props: P & React.RefAttributes<T>) => React.ReactNode | null
// }

export interface PopoverRefs {
  show: (
    elRect: Parameters<typeof popoverRefShow>[1],
    option?: Parameters<typeof popoverRefShow>[2]
  ) => void
  hide: () => void
}

export const Popover = forwardRef<PopoverRefs, Omit<HTMLProps<HTMLDivElement>, 'ref'>>(
  ({ children, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>()

    useImperativeHandle(ref, () => ({
      show(elRect, option) {
        if (!containerRef.current) {
          return
        }
        popoverRefShow(containerRef.current, elRect, option)
      },
      hide() {
        if (!containerRef.current) {
          return
        }
        containerRef.current.style.opacity = '0'
      },
    }))

    return (
      <Portal>
        <div
          {...props}
          ref={containerRef as LegacyRef<HTMLDivElement>}
          className={cx('popover-container', props.className)}
          tabIndex={0}
        >
          {children}
        </div>
      </Portal>
    )
  }
)

const popoverRefShow = (
  popEl: HTMLElement,
  triggerRect: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>,
  option: {
    placement?: 'top' | 'bottom'
  } = {}
) => {
  const { left, right, top, bottom } = triggerRect
  const { width, height } = popEl.getBoundingClientRect()
  const { placement = 'bottom' } = option

  popEl.style.opacity = '1'
  // 默认和target左对齐
  if (left + width < window.innerWidth) {
    popEl.style.left = `${left + window.scrollX}px`
    popEl.style.right = 'unset'
  } else {
    popEl.style.right = `${window.innerWidth - right - window.scrollX}px`
    popEl.style.left = 'unset'
  }

  // 1. 默认对齐target底部bottom，如果popover超出屏幕底部则对齐target顶部
  // 2. 对齐target顶部top，如果popover不超出屏幕顶部则对齐target顶部
  if (
    (placement === 'bottom' && bottom + height < window.innerHeight) ||
    (placement === 'top' && top - height < 0)
  ) {
    popEl.style.top = `${bottom + window.scrollY + 10}px`
    popEl.style.bottom = 'unset'
  } else {
    popEl.style.bottom = `${window.innerHeight - top - window.scrollY + 10}px`
    popEl.style.top = 'unset'
  }
}
