import { FC, ReactNode } from 'react'
import { Icon, Popover, PopoverProps } from '~common'
import cx from 'classnames'

import './modal.scss'

export type ModalProps = PopoverProps & {
  header?: ReactNode
  footer?: ReactNode
  onOk?: () => void
  onCancel?: () => void
}

export const Modal: FC<ModalProps> = ({
  children,
  overlay = true,
  visible,
  header,
  footer,
  onOk,
  onCancel,
  ...popoverProps
}) => {
  if (!visible) {
    return null
  }

  const handleClose = () => {
    onCancel?.()
    popoverProps?.onVisibleChange?.(false)
    popoverProps?.onClose?.()
  }

  const handleOk = () => {
    onOk?.()
    popoverProps?.onVisibleChange?.(false)
    popoverProps?.onClose?.()
  }

  return (
    <Popover
      overlayClassName={cx('modal-overlay', visible && 'modal-overlay--visible')}
      overlay={overlay}
      {...popoverProps}
    >
      {header && <div className="modal-header flex-center">{header}</div>}
      <div className="modal-body">{children}</div>
      {footer ? (
        footer
      ) : (
        <div className="modal-footer flex-center">
          <button onClick={handleClose}>Cancel</button>
          <button onClick={handleOk}>OK</button>
        </div>
      )}

      <div className="modal-close flex-center" onClick={handleClose}>
        <Icon name="icon-close"></Icon>
      </div>
    </Popover>
  )
}
