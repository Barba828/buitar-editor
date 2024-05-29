import { FC, HTMLProps, ReactNode } from 'react'
import cx from 'classnames'
import './list-item.scss'
import { Icon } from '~common'

export interface ListItemProps extends HTMLProps<HTMLDivElement> {
  item: { title?: string; desc?: string; icon?: string }
  left?: ReactNode
  right?: ReactNode
}

export const ListItem: FC<ListItemProps> = ({ item, left, right, className, ...attrs }) => {
  const { title, desc, icon } = item
  return (
    <div {...attrs} className={cx('toolbar-chord-item flex items-center w-full cursor-pointer', className)}>
      {left ||
        (icon && (
          <div className="toolbar-chord-item--left flex-center">
            <Icon name={icon} />
          </div>
        ))}
      <div className="toolbar-chord-middle flex flex-column justify-center">
        {title && <div className="toolbar-chord-item--title">{title}</div>}
        {desc && <div className="toolbar-chord-item--desc">{desc}</div>}
      </div>
      {right}
    </div>
  )
}
