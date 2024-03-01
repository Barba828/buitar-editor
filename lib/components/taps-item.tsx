import { memo } from 'react'
import { type BoardChord } from '@buitar/to-guitar'
import { SvgChord } from '@buitar/svg-chord'
import { RenderElementProps, useFocused, useSelected } from 'slate-react'
import { getChordName, transToSvgPoints } from '../utils'
import { CustomInlineChordElement } from '../custom-types'
import { isLightMode } from '../utils/media-query'
import cx from 'classnames'
import './components.scss'

export const PopoverTapsItem = memo(({ taps, size = 100 }: { taps: BoardChord; size?: number }) => {
  return (
    <div className="popover-taps-item ">
      <SvgChord
        points={transToSvgPoints(taps.chordTaps)}
        size={size}
        concise={false}
        color={isLightMode() ? '#444' : '#ddd'}
      />
      <p className="popover-taps-item__title">
        <span className="popover-taps-item__note">{getChordName(taps.chordType)}</span>
        <br/>
        <span className='popover-taps-item__name'>{taps.chordType.name}</span>
      </p>
    </div>
  )
})

export const InlineTapsItem = ({ attributes, children, element }: RenderElementProps) => {
  const selected = useSelected()
  const focused = useFocused()
  const { taps, concise } = element as CustomInlineChordElement
  const title = getChordName(taps.chordType)

  return (
    <span {...attributes}>
      <SvgChord
        points={transToSvgPoints(taps.chordTaps)}
        size={60}
        concise={concise}
        title={title}
        className={cx('inline-taps-item', selected && focused && 'inline-taps-item--active')}
        color={isLightMode() ? '#444' : '#ddd'}
        style={{ padding: concise ? undefined : '2px 3px' }}
      />
      {children}
    </span>
  )
}
