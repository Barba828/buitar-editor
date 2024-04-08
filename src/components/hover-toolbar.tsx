import { useEffect, useCallback, useState, FC, HTMLProps } from 'react'
import { CustomTypes, Editor, Range, Element as SlateElement, Transforms } from 'slate'
import { useSlate } from 'slate-react'
import {
  Popover,
  InputChordPopover,
  getSelectedRect,
  isBlockActive,
  isMarkActive,
  getSelectedBlockType,
} from '../../lib'
import type { BlockFormat, TextFormat } from '../../lib'
import { TextTypePopover } from './text-type-popover'
import { chordTypeMenu, textTypeMenu } from './text-type.config'

import cx from 'classnames'
import './hover-toolbar.scss'

const LIST_TYPES = ['numbered-list', 'bulleted-list']
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify']
const flatTypeArr = [...textTypeMenu, ...chordTypeMenu]

const toggleMark = (editor: Editor, format: TextFormat) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const toggleBlock = (editor: Editor, format: BlockFormat) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
  )
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  })
  let newProperties: Partial<SlateElement>
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    }
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    }
  }
  Transforms.setNodes<SlateElement>(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block as CustomTypes['Element'])
  }
}

export const HoverToolbar = () => {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [visible, setVisible] = useState<boolean>(false)
  const [chordPopoverVisible, setChordPopoverVisible] = useState<boolean>(false)
  const [textPopoverVisible, setTextPopoverVisible] = useState<boolean>(false)
  const [blockType, setBlockType] = useState<(typeof flatTypeArr)[0]>(flatTypeArr[0])
  const editor = useSlate()
  const { selection } = editor

  /**判断是否显示toolbar */
  useEffect(() => {
    setVisible(
      Boolean(
        selection && !Range.isCollapsed(selection) && Editor.string(editor, selection).length > 0
      )
    )
    chordPopoverVisible && setChordPopoverVisible(false)
    textPopoverVisible && setTextPopoverVisible(false)

    const format = getSelectedBlockType(editor)
    const blockType = flatTypeArr.find((item) => item.key === format)
    setBlockType(blockType)
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
  }, [editor, visible])

  const cleanInputChord = useCallback(() => {
    setChordPopoverVisible(false)
    if (isMarkActive(editor, 'chord')) {
      editor.removeMark('chord')
      return
    }
  }, [editor])

  if (!visible || !rect) {
    return null
  }

  return (
    <>
      <Popover
        className="hover-toolbar"
        onVisibleChange={setVisible}
        rect={rect}
        option={{ placement: 'top' }}
      >
        <div className="toolbar-menu-group">
          <div
            className="toolbar-menu-item"
            onClick={() => setTextPopoverVisible(!textPopoverVisible)}
          >
            {blockType.title}
          </div>
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
          <FormatButton format="code">
            <strong style={{ fontSize: '0.8rem' }}>{`</>`}</strong>
          </FormatButton>
        </div>
        <div className="toolbar-menu-group">
          <FormatButton format="chord" onClick={() => setChordPopoverVisible(!chordPopoverVisible)}>
            C
          </FormatButton>
          <FormatChordButton option={'concise'}>D</FormatChordButton>
          <FormatChordButton option={'popover'}>P</FormatChordButton>
          <FormatChordButton option={''} style={{ color: '#c21500' }} onClick={cleanInputChord}>
            X
          </FormatChordButton>
        </div>
      </Popover>
      <TextTypePopover
        visible={textPopoverVisible}
        onVisibleChange={setTextPopoverVisible}
        toggleBlock={toggleBlock}
      />
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
  return (
    <div
      className={cx('toolbar-menu-item', active && 'toolbar-menu-item--active')}
      onClick={() => toggleMark(editor, format)}
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

  const onClick = useCallback(() => {
    const chord = Editor.marks(editor)?.['chord']
    Editor.addMark(editor, 'chord', { ...chord, [option]: !active })
  }, [active, editor, option])

  if (!marks?.chord) {
    return null
  }

  return (
    <div
      className={cx('toolbar-menu-item', active && 'toolbar-menu-item--active')}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}
