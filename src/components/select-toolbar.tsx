import { useEffect, useCallback, useState, FC, HTMLProps, MouseEventHandler, useMemo } from 'react'
import { Editor, Range } from 'slate'
import { useSlate } from 'slate-react'
import { InputChordPopover } from '~chord'
import { getSelectedRect, Icon, isBlockActive, isMarkActive, Popover } from '~common'
import { TextTypePopover } from './text-type-popover'
import { useBlockType } from './utils/use-block-type'
import { ONLY_ONE_WRAP_TYPES } from '../plugins/config'
import cx from 'classnames'

import './select-toolbar.scss'

export const SelectToolbar = () => {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [visible, setVisible] = useState<boolean>(false)
  const [chordPopoverVisible, setChordPopoverVisible] = useState<boolean>(false)
  const [textPopoverVisible, setTextPopoverVisible] = useState<boolean>(false)
  const editor = useSlate()
  const { selection } = editor

  const { selectType } = useBlockType()

  /**判断是否显示toolbar */
  useEffect(() => {
    setVisible(
      Boolean(
        selection && !Range.isCollapsed(selection) && Editor.string(editor, selection).length > 0
      )
    )
    chordPopoverVisible && setChordPopoverVisible(false)
    textPopoverVisible && setTextPopoverVisible(false)
  }, [editor, selection])

  /**显示toolbar位置 */
  useEffect(() => {
    if (!visible) {
      return
    }

    const selectedRect = getSelectedRect(editor)
    if (!selectedRect) {
      return
    }
    setRect(selectedRect)
  }, [editor, visible, selection])

  /**当前展示是否是基本文本Tool */
  const isBasicToolbar = useMemo(() => {
    return isBlockActive(editor, ONLY_ONE_WRAP_TYPES)
  }, [editor, selection])

  const cleanInputChord = useCallback(() => {
    setChordPopoverVisible(false)
    if (isMarkActive(editor, 'chord')) {
      editor.removeMark('chord')
      return
    }
  }, [editor])

  const cleanFormat = useCallback(() => {
    editor.toggleBlock?.({ type: selectType.key as BlockFormat }, { toActive: false })
  }, [editor, selectType])

  if (!visible || !rect) {
    return null
  }

  return (
    <>
      <Popover
        className="select-toolbar"
        onVisibleChange={setVisible}
        rect={rect}
        option={{ placement: 'top' }}
      >
        <div className="toolbar-menu-group">
          <div
            className="toolbar-menu-item"
            onMouseDown={() => setTextPopoverVisible(!textPopoverVisible)}
          >
            {selectType.title}
          </div>
          {selectType.key !== 'paragraph' && (
            <div className="toolbar-menu-item">
              <Icon name="icon-clean-up" onClick={cleanFormat} />
            </div>
          )}
        </div>
        <div className="toolbar-menu-group">
          <FormatButton format="bold">
            <strong>B</strong>
          </FormatButton>
          <FormatButton format="italic">
            <em>I</em>
          </FormatButton>
          <FormatButton format="underlined">
            <u>U</u>
          </FormatButton>
          <FormatButton format="strike">
            <s>S</s>
          </FormatButton>
          {!isBasicToolbar && (
            <FormatButton format="code">
              <strong style={{ fontSize: '0.8rem' }}>{`</>`}</strong>
            </FormatButton>
          )}
        </div>
        {!isBasicToolbar && (
          <div className="toolbar-menu-group">
            <div
              className={cx(
                'toolbar-menu-item',
                isMarkActive(editor, 'chord') && 'toolbar-menu-item--active'
              )}
              onMouseDown={() => setChordPopoverVisible(!chordPopoverVisible)}
            >
              <Icon name="icon-chord" />
            </div>
            <FormatChordButton option={'concise'}>
              <Icon name="icon-title" />
            </FormatChordButton>
            <FormatChordButton option={'popover'}>
              <Icon name="icon-popover" />
            </FormatChordButton>
            <FormatChordButton option={''} style={{ color: '#c21500' }} onClick={cleanInputChord}>
              <Icon name="icon-remove" />
            </FormatChordButton>
          </div>
        )}
      </Popover>
      <TextTypePopover visible={textPopoverVisible} onVisibleChange={setTextPopoverVisible} />
      <InputChordPopover visible={chordPopoverVisible} onVisibleChange={setChordPopoverVisible} />
    </>
  )
}

const FormatButton: FC<{ format: TextFormat } & HTMLProps<HTMLDivElement>> = ({
  format,
  children,
  ...props
}) => {
  const editor = useSlate()
  const active = isMarkActive(editor, format)
  const onMouseDown: MouseEventHandler<HTMLDivElement> = useCallback((e) => {
    e.preventDefault()
    editor.toggleMark?.(format)
  }, [])
  return (
    <div
      className={cx('toolbar-menu-item', active && 'toolbar-menu-item--active')}
      onMouseDown={onMouseDown}
      {...props}
    >
      {children}
    </div>
  )
}

const FormatChordButton: FC<{ option: string } & HTMLProps<HTMLDivElement>> = ({
  option,
  children,
  ...props
}) => {
  const editor = useSlate()
  const marks = Editor.marks(editor)
  const active = marks?.chord ? (marks.chord as never)?.[option] : false

  const onMouseDown: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.preventDefault()
      const chord = Editor.marks(editor)?.['chord']
      Editor.addMark(editor, 'chord', { ...chord, [option]: !active })
    },
    [active, editor, option]
  )

  if (!marks?.chord) {
    return null
  }

  return (
    <div
      className={cx('toolbar-menu-item', active && 'toolbar-menu-item--active')}
      onMouseDown={onMouseDown}
      {...props}
    >
      {children}
    </div>
  )
}
