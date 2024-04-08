import { FC } from 'react'
import './list-item.scss'

export const ListItem: FC<{ title: string; desc: string }> = ({ title, desc }) => {
  return (
    <div className="toolbar-chord-item">
      <div className="toolbar-chord-item--title">{title}</div>
      <div className="toolbar-chord-item--desc">{desc}</div>
    </div>
  )
}
