import { memo, useCallback, useMemo } from 'react'
import { type BoardChord } from '@buitar/to-guitar'
import { SvgChord } from '@buitar/svg-chord'
import {
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
  useFocused,
  useReadOnly,
  useSelected,
  useSlateStatic,
} from 'slate-react'
import { capitalizeEveryWord, getChordName } from '../utils'
import { ButtonGroup, useIsLightMode } from '~common'
import { type CustomInlineChordElement } from '~chord'
import { transToSvgPoints } from '../utils/trans-svg'

import cx from 'classnames'
import './taps-item.scss'
import { Transforms } from 'slate'

export const TapsListItem = memo(({ taps, size = 80 }: { taps: BoardChord; size?: number }) => {
  const isLight = useIsLightMode()
  return (
    <div className="taps-list-item">
      <SvgChord
        points={transToSvgPoints(taps.chordTaps)}
        size={size}
        concise={false}
        color={isLight ? '#444' : '#ddd'}
      />
      <div className="taps-list-item__wrap flex-center flex-column">
        <div className="taps-list-item__note">{getChordName(taps.chordType)}</div>
        <div className="taps-list-item__name">{capitalizeEveryWord(taps.chordType.name)}</div>
      </div>
    </div>
  )
})

const INLINE_TAPS_MAX_SIZE = 10
const INLINE_TAPS_MIN_SIZE = 0
export const InlineTapsItem = ({ attributes, element, children }: RenderElementProps) => {
  const readOnly = useReadOnly()
  const selected = useSelected()
  const focused = useFocused()
  const isLight = useIsLightMode()
  const editor = useSlateStatic()
  const { taps, concise, size = 1 } = element as CustomInlineChordElement
  const title = getChordName(taps.chordType)

  const handleChangeConcise = useCallback(() => {
    Transforms.setNodes(
      editor,
      { concise: !concise },
      { at: ReactEditor.findPath(editor, element) }
    )
  }, [concise, editor, element])

  const handleEdit = useCallback(() => {
    Transforms.setNodes(
      editor,
      { type: 'paragraph' },
      { at: ReactEditor.findPath(editor, element) }
    )
    Transforms.insertText(editor, `-C${title}`)
  }, [editor, element, title])

  const handleRemove = useCallback(() => {
    Transforms.removeNodes(editor, { at: ReactEditor.findPath(editor, element) })
  }, [editor, element])

  const handleIncreaseSize = useCallback(() => {
    if (size >= INLINE_TAPS_MAX_SIZE) return
    Transforms.setNodes(editor, { size: size + 1 }, { at: ReactEditor.findPath(editor, element) })
  }, [editor, element, size])

  const handleDecreaseSize = useCallback(() => {
    if (size <= INLINE_TAPS_MIN_SIZE) return
    Transforms.setNodes(editor, { size: size - 1 }, { at: ReactEditor.findPath(editor, element) })
  }, [editor, element, size])

  const btns = useMemo(
    () =>
      [
        { icon: <div className="inline-taps-item__tools-title">{title}</div> },
        { icon: 'icon-edit-pencil', onClick: handleEdit },
        { icon: 'icon-title', onClick: handleChangeConcise, checked: !concise },
        size > INLINE_TAPS_MIN_SIZE && { icon: 'icon-remove-minus', onClick: handleDecreaseSize },
        size < INLINE_TAPS_MAX_SIZE && { icon: 'icon-add-plus', onClick: handleIncreaseSize },
        { icon: 'icon-close', onClick: handleRemove },
      ].filter((it) => !!it),
    [concise, handleChangeConcise, handleDecreaseSize, handleEdit, handleIncreaseSize, handleRemove, size, title]
  )

  if (!taps) {
    return children
  }

  return (
    <span
      {...attributes}
      data-taps-title={title}
      contentEditable={false}
      suppressContentEditableWarning
      className={cx('inline-taps-item__wrapper', {
        'inline-taps-item__wrapper--active': selected && focused,
      })}
    >
      <SvgChord
        points={transToSvgPoints(taps.chordTaps)}
        size={10 * (5 + Number(size) || 1)}
        concise={concise}
        title={title}
        className={cx('inline-taps-item')}
        color={isLight ? '#444' : '#ddd'}
      />
      {!readOnly && (
        <div className="inline-taps-item__tools">
          <ButtonGroup btns={btns} />
        </div>
      )}
      {children}
    </span>
  )
}

export const FixedTapsItem = ({ leaf, children }: RenderLeafProps) => {
  const readOnly = useReadOnly()
  const isLight = useIsLightMode()
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
        color={isLight ? '#444' : '#ddd'}
        style={{ padding: concise ? undefined : '2px 3px' }}
      />
      <span contentEditable={!readOnly} suppressContentEditableWarning>
        {children}
      </span>
    </span>
  )
}
