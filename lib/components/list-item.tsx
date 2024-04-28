import { FC, ReactNode } from 'react'
import './list-item.scss'

interface ListItemProps { 
  item: { title?: string; desc?: string }, 
  left?: ReactNode, 
  right?: ReactNode
}

export const ListItem: FC<ListItemProps> = ({ item, left, right }) => {
  const { title, desc } = item
  return (
    <div className="toolbar-chord-item">
      {left}
      <div className="toolbar-chord-middle">
        <div className="toolbar-chord-item--title">{title}</div>
        <div className="toolbar-chord-item--desc">{desc}</div>
      </div>
      {right}
    </div>
  )
}
