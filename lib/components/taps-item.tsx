import { getNoteByPitch, transToSvgPoints } from '../utils'
import { type BoardChord } from '@buitar/to-guitar'
import { SvgChord } from '@buitar/svg-chord'
import { RenderElementProps, useFocused, useSelected } from 'slate-react'
import { CustomInlineChordElement } from '../custom-types'
import { isLightMode } from '../utils/media-query'
import cx from 'classnames'
import './components.scss'

export const PopoverTapsItem = ({ taps }: { taps: BoardChord }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <SvgChord
        points={transToSvgPoints(taps.chordTaps)}
        size={100}
        concise={false}
        color={isLightMode() ? '#444' : '#ddd'}
      />
      <p style={{ fontWeight: 'bold', opacity: 0.6, marginRight: '6px' }}>
        <span style={{ fontSize: 24, margin: '0 6px' }}>
          {getNoteByPitch(taps.chordType.tone || 0)}
        </span>
        {taps.chordType.name}
      </p>
    </div>
  )
}

export const InlineTapsItem = ({ attributes, children, element }: RenderElementProps) => {
  const selected = useSelected()
  const focused = useFocused()
  const { taps, concise } = element as CustomInlineChordElement
  const title = `${getNoteByPitch(taps.chordType.tone || 0)}${taps.chordType.tag}`

  return (
    <span {...attributes}>
      <SvgChord
        points={transToSvgPoints(taps.chordTaps)}
        size={60}
        concise={concise}
        title={title}
        className={cx('taps-item', selected && focused && 'taps-item-active')}
        color={isLightMode() ? '#444' : '#ddd'}
        style={{ padding: concise ? undefined : '2px 3px' }}
      />
      {children}
    </span>
  )
}
