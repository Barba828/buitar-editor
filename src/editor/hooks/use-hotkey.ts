import { Editor, Range, Element as SlateElement } from 'slate'
import isHotkey from 'is-hotkey'
import { ReactEditor, useSlate } from 'slate-react'

// const HOTKEYS = {
//     // 'mod+b': 'bold',
//     // 'mod+i': 'italic',
//     // 'mod+u': 'underline',
//     // 'mod+`': 'code',
//   }

const useHotkey = () => {
  const editor = useSlate()

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (isHotkey('mod+a', event)) {
      event.preventDefault()

      const { selection } = editor
      if (selection && Range.isCollapsed(selection)) {
        const match = Editor.above(editor, {
          match: (n) =>
            !Editor.isEditor(n) && SlateElement.isElement(n) && Editor.isBlock(editor, n),
        })
        if (match && match[0] && !editor.isEmpty(match[0] as SlateElement)) {
          editor.select(match[1])
          return
        }
      }

      editor.select({
        anchor: editor.start([]),
        focus: editor.end([]),
      })
      ReactEditor.blur(editor)
    }
  }

  return { onKeyDown }
}

export default useHotkey
export { useHotkey }
