import { useRef, useEffect, useMemo, useCallback, useState, FC, HTMLProps } from 'react'
import { Editor, Range } from 'slate'
import { useSlate } from 'slate-react'
import { Popover, InputChordPopover, type PopoverRefs, type CustomText } from '../../lib'
import cx from 'classnames'

import './hover-toolbar.scss'

type TextFormat = keyof Omit<CustomText, 'text'>

const toggleMark = (editor: Editor, format: TextFormat) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isMarkActive = (editor: Editor, format: TextFormat) => {
  const marks = Editor.marks(editor)
  return marks ? !!marks[format] : false
}

export const HoverToolbar = () => {
  const ref = useRef<PopoverRefs>(null)
  const [chordPopoverVisible, setChordPopoverVisible] = useState<boolean>(false)
  const editor = useSlate()
  // const inFocus = useFocused()
  const { selection } = editor

  const invisible = useMemo(
    () => !selection || Range.isCollapsed(selection) || Editor.string(editor, selection) === '',
    [editor, selection]
  )

  useEffect(() => {
    if (!ref.current) {
      chordPopoverVisible && setChordPopoverVisible(false)
      return
    }

    const domSelection = window.getSelection()

    if (!domSelection || invisible) {
      ref.current.hide()
      chordPopoverVisible && setChordPopoverVisible(false)
      return
    }
    const domRange = domSelection.getRangeAt(0)
    const rect = domRange.getBoundingClientRect()
    ref.current.show(rect, { placement: 'top' })
  })

  const openInputChordPopover = useCallback(() => {
    if (isMarkActive(editor, 'chord')) {
      editor.removeMark('chord')
      return
    }
    setChordPopoverVisible(true)
  }, [])

  if (invisible) {
    return null
  }

  return (
    <>
      <Popover
        ref={ref}
        className="hover-toolbar"
        onMouseDown={(e) => {
          // prevent toolbar from taking focus away from editor
          e.preventDefault()
        }}
      >
        <div className="toolbar-menu-group">
          <div className="toolbar-menu-item">Text</div>
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
          <FormatButton format="chord" onClick={openInputChordPopover}>
            C
          </FormatButton>
          <FormatChordButton option={'concise'}>D</FormatChordButton>
          <FormatChordButton option={'popover'}>P</FormatChordButton>
        </div>
      </Popover>
      <InputChordPopover visible={chordPopoverVisible}></InputChordPopover>
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
