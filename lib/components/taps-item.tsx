import { memo } from 'react'
import { type BoardChord } from '@buitar/to-guitar'
import { SvgChord } from '@buitar/svg-chord'
import {
  RenderElementProps,
  RenderLeafProps,
  useFocused,
  useReadOnly,
  useSelected,
} from 'slate-react'
import { capitalizeEveryWord, getChordName } from '../utils'
import { isLightMode } from '~common'
import { type CustomInlineChordElement } from '~chord'
import { transToSvgPoints } from '../utils/trans-svg'

import cx from 'classnames'
import './taps-item.scss'

export const TapsListItem = memo(({ taps, size = 80 }: { taps: BoardChord; size?: number }) => {
  return (
    <div className="taps-list-item">
      <SvgChord
        points={transToSvgPoints(taps.chordTaps)}
        size={size}
        concise={false}
        color={isLightMode() ? '#444' : '#ddd'}
      />
      <div className="taps-list-item__wrap flex-center flex-column">
        <div className="taps-list-item__note">{getChordName(taps.chordType)}</div>
        <div className="taps-list-item__name">{capitalizeEveryWord(taps.chordType.name)}</div>
      </div>
    </div>
  )
})

export const InlineTapsItem = ({ attributes, element, children }: RenderElementProps) => {
  const selected = useSelected()
  const focused = useFocused()
  const { taps, concise } = element as CustomInlineChordElement
  if (!taps) {
    return children
  }
  const title = getChordName(taps.chordType)

  return (
    <span {...attributes} data-taps-title={title}>
      <SvgChord
        contentEditable={false}
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

export const FixedTapsItem = ({ leaf, children }: RenderLeafProps) => {
  const readOnly = useReadOnly()
  if (!leaf?.chord || !leaf.chord?.taps) {
    return children
  }
  const { taps, concise, popover } = leaf.chord
  const title = getChordName(taps.chordType)

  return (
    <span className={cx('fixed-taps-item', popover && 'popover-taps-item')} data-taps-title={title}>
      <SvgChord
        contentEditable={false}
        points={transToSvgPoints(taps.chordTaps)}
        size={60}
        concise={concise}
        title={title}
        className={cx('fixed-taps-item__fixed', popover && 'popover-taps-item__fixed')}
        color={isLightMode() ? '#444' : '#ddd'}
        style={{ padding: concise ? undefined : '2px 3px' }}
      />
      <span contentEditable={!readOnly} suppressContentEditableWarning>
        {children}
      </span>
    </span>
  )
}
