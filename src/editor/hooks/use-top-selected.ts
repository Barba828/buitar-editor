import { Element as SlateElement } from 'slate'
import { ReactEditor, useSelected, useSlate } from 'slate-react'
import { useMemo } from 'react'
import { useEditableContext } from './use-editable-context'

const useTopSelected = (element: SlateElement) => {
  const editor = useSlate()
  const selected = useSelected()
  const { selectedDepth: depth } = useEditableContext()!

  const path = useMemo(() => ReactEditor.findPath(editor, element), [editor, element])
  const isSelected = useMemo(() => {
    return path.length === depth && selected
  }, [depth, path, selected])

  return isSelected
}

export { useTopSelected }
