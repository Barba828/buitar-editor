import {
  HTMLProps,
  LegacyRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import { Portal } from './portal'
import cx from 'classnames'

import './popover.scss'

// declare module 'react' {
//   function forwardRef<T, P = unknown>(
//     render: (props: P, ref: React.Ref<T>) => React.ReactNode | null
//   ): (props: P & React.RefAttributes<T>) => React.ReactNode | null
// }

export interface CommonPopoverProps {
  overlay?: boolean
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
}

export interface PopoverRefs {
  show: (
    elRect: Parameters<typeof popoverRefShow>[1],
    option?: Parameters<typeof popoverRefShow>[2]
  ) => void
  hide: () => void
}

export type PopoverProps = Omit<HTMLProps<HTMLDivElement>, 'ref'> &
  CommonPopoverProps & {
    rect?: Parameters<typeof popoverRefShow>[1] | null
    option?: Parameters<typeof popoverRefShow>[2]
    onClose?: () => void
    onShow?: () => void
    overlayClassName?: string
  }

export const Popover = forwardRef<PopoverRefs, PopoverProps>(
  (
    {
      children,
      rect,
      option,
      onShow,
      onClose,
      onVisibleChange,
      overlay,
      overlayClassName,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>()

    const hide = useCallback(() => {
      if (!containerRef.current) {
        return
      }
      popoverRefHide(containerRef.current)
      onClose?.()
      onVisibleChange?.(false)
    }, [onClose, onVisibleChange])

    const show: PopoverRefs['show'] = useCallback(
      (elRect, option) => {
        if (!containerRef.current) {
          return
        }
        popoverRefShow(containerRef.current, elRect, option)
        onShow?.()
        onVisibleChange?.(true)
      },
      [onShow, onVisibleChange]
    )

    useImperativeHandle(ref, () => ({
      show,
      hide,
    }))

    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.stopPropagation()
          event.preventDefault()
          hide()
        }
      },
      [hide]
    )

    // const handleClickOutside = useCallback(
    //   (event: MouseEvent) => {
    //     if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
    //       hide()
    //     }
    //   },
    //   [hide]
    // )

    useEffect(() => {
      document.addEventListener('keydown', handleKeyDown)
      // document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        // document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [handleKeyDown])

    useEffect(() => {
      if (!rect) {
        return
      }
      show(rect, option)
    }, [rect, option, show])

    const content = (
      <div
        {...props}
        onMouseDown={(e) => {
          // e.preventDefault()
          e.stopPropagation()
          props?.onMouseDown?.(e)
        }}
        onClick={(e) => {
          e.stopPropagation()
          props?.onClick?.(e)
        }}
        ref={containerRef as LegacyRef<HTMLDivElement>}
        className={cx('popover-container', props.className)}
        tabIndex={0}
      >
        {children}
      </div>
    )

    return (
      <Portal>
        {overlay ? (
          <div className={cx('popover-overlay', overlayClassName)} onClick={hide}>
            {content}
          </div>
        ) : (
          content
        )}
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
  popEl.style.removeProperty('display');
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

const popoverRefHide = (popEl: HTMLElement) => {
  popEl.style.opacity = '0'
  popEl.style.display = 'none'
  popEl.style.right = 'unset'
  popEl.style.left = 'unset'
  popEl.style.bottom = 'unset'
  popEl.style.top = 'unset'
}
