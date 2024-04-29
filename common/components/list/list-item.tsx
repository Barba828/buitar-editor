import { FC, HTMLProps, ReactNode } from 'react'
import cx from 'classnames'
import './list-item.scss'

interface ListItemProps extends HTMLProps<HTMLDivElement> {
  item: { title?: string; desc?: string }
  left?: ReactNode
  right?: ReactNode
}

export const ListItem: FC<ListItemProps> = ({ item, left, right, ...attrs }) => {
  const { title, desc } = item
  return (
    <div {...attrs} className={cx("toolbar-chord-item", attrs.className)}>
      {left}
      <div className="toolbar-chord-middle">
        <div className="toolbar-chord-item--title">{title}</div>
        <div className="toolbar-chord-item--desc">{desc}</div>
      </div>
      {right}
    </div>
  )
}
