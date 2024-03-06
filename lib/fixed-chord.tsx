import { useRef, useEffect, useMemo } from 'react'
import { Editor, Range } from 'slate'
import { useSlate, useFocused } from 'slate-react'
import { Popover, type PopoverRefs } from './components/popover'

import './fixed-chord.scss'

export const FixedChordPopover = () => {
  const ref = useRef<PopoverRefs>(null)
  const editor = useSlate()
  const inFocus = useFocused()
  const { selection } = editor

  const invisible = useMemo(
    () =>
      !selection ||
      !inFocus ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === '',
    [editor, selection, inFocus]
  )

  useEffect(() => {
    if (!ref.current) {
      return
    }

    const domSelection = window.getSelection()

    if (!domSelection || invisible) {
      ref.current.hide()
      return
    }

    const domRange = domSelection.getRangeAt(0)
    const rect = domRange.getBoundingClientRect()
    ref.current.show(rect, { placement: 'top' })
  })

  if (invisible) {
    return null
  }

  return (
    <Popover ref={ref} className="fixed-container">
      <div className="fixed-menu-group">
        <div className="fixed-menu-item">C</div>
        <div className="fixed-menu-item">c</div>
        <div className="fixed-menu-item">X</div>
        <div className="fixed-menu-item">x</div>
      </div>
      <div className="fixed-menu-group">
        <div className="fixed-menu-item">R</div>
        <div className="fixed-menu-item">r</div>
        <div className="fixed-menu-item">T</div>
        <div className="fixed-menu-item">t</div>
      </div>
    </Popover>
  )
}
