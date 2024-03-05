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
  show: (elRect: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>) => void
  hide: () => void
}

export const Popover = forwardRef<PopoverRefs, Omit<HTMLProps<HTMLDivElement>, 'ref'>>(
  ({ children, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>()

    useImperativeHandle(ref, () => ({
      show(elRect) {
        if (!containerRef.current) {
          return
        }
        popoverRefShow(containerRef.current, elRect)
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
          className={cx("popover-container", props.className)}
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
  triggerRect: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>
) => {
  const { left, right, top, bottom } = triggerRect
  const { width, height } = popEl.getBoundingClientRect()

  popEl.style.opacity = '1'
  if (left + width < window.innerWidth) {
    popEl.style.left = `${left + window.scrollX}px`
    popEl.style.right = 'unset'
  } else {
    popEl.style.right = `${window.innerWidth - right - window.scrollX}px`
    popEl.style.left = 'unset'
  }
  if (bottom + height < window.innerHeight) {
    popEl.style.top = `${bottom + window.scrollY + 6}px`
    popEl.style.bottom = 'unset'
  } else {
    popEl.style.bottom = `${window.innerHeight - top - window.scrollY - 6}px`
    popEl.style.top = 'unset'
  }
}
