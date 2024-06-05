import { Editor, Path, Range, Element as SlateElement, Transforms } from 'slate'
import isHotkey from 'is-hotkey'
import { ReactEditor, useFocused, useSlate } from 'slate-react'
import { useFilesContext } from '~/utils/use-files-context'

const useHotkey = () => {
  const editor = useSlate()
  const focused = useFocused()
  const { updateFile } = useFilesContext()!
  const { selection } = editor

  const onKeyDown = (event: KeyboardEvent) => {
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
      return
    }

    if (isHotkey('mod+s', event)) {
      event.preventDefault()
      updateFile()
      return
    }

    if (isHotkey('mod+d', event)) {
      const match = Editor.above(editor, {
        match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
      })
      if (match) {
        const [node, path] = match
        Transforms.insertNodes(editor, { ...node }, { at: Path.next(path) })
        Transforms.select(editor, Path.next(path))
        event.preventDefault()
        return
      }
    }

    if (isHotkey('esc', event)) {
      event.preventDefault()
      ReactEditor.blur(editor)
      return
    }

    if (isHotkey('tab', event)) {
      const match = Editor.above(editor, {
        match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
      })
      if (match) {
        const [, path] = match
        const start = Editor.start(editor, path)
        Transforms.insertText(editor, '\t', { at: start })
        event.preventDefault()
        return
      }
    }

    if (isHotkey(['backspace', 'delete'], event)) {
      if (selection && !Range.isCollapsed(selection) && !focused) {
        Transforms.removeNodes(editor, { at: selection })
      }
    }
  }

  return { onKeyDown }
}

export default useHotkey
export { useHotkey }
