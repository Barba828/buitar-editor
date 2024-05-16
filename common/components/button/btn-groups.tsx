import { FC, HTMLProps, ReactNode } from 'react'
import { Icon, IconProps } from '~common'
import cx from 'classnames'

import './btn-groups.scss'

interface ButtonGroupProps extends HTMLProps<HTMLDivElement> {
  btns?: Array<
    {
      icon: string | ReactNode
      onClick?: () => void
      checked?: boolean
    } & Partial<IconProps>
  >
}

export const ButtonGroup: FC<ButtonGroupProps> = ({ btns, className, children, ...props }) => {
  return (
    <div {...props} className={cx('btn-groups', className)} contentEditable={false}>
      {btns
        ?.filter((it) => !!it)
        ?.map(({ icon, onClick, checked, ...iconsProps }, index) => (
          <div
            key={index}
            className={cx('btn-groups__btn', 'flex-center', { 'btn-groups__btn--active': checked })}
            onClick={onClick}
          >
            {typeof icon === 'string' ? <Icon name={icon} {...iconsProps}></Icon> : icon}
          </div>
        ))}
      {children}
    </div>
  )
}
