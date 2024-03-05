import { useRef, useEffect, useMemo } from 'react'
import { Editor, Range } from 'slate'
import { useSlate, useFocused } from 'slate-react'
import { Popover, type PopoverRefs } from './components/popover'

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
    ref.current.show(rect)
  })

  if (invisible) {
    return null
  }

  return (
    <Popover ref={ref}>
      <div>TODO: chord selector</div>
    </Popover>
  )
}
