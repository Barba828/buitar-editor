import { chordTagMap } from '@buitar/to-guitar'
import { FC } from 'react'
import { getNoteAndTag } from '../utils'

import './components.scss'

export const ChordNameItem: FC<{ chordName: string }> = ({ chordName }) => {
  const { tag } = getNoteAndTag(chordName)
  const chordObj = chordTagMap.get(tag)
  return (
    <div className="chord-key-item">
      <div className="chord-key-item__title">{chordName}</div>
      <div className="chord-key-item__constitute">
        {chordObj?.constitute?.map((item) => (
          <div key={item} className="constitute-number flex-center">
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
