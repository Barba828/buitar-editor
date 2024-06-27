import { Element as SlateElement, Range } from 'slate'
import { ReactEditor, useSelected, useSlate } from 'slate-react'
import { useMemo } from 'react'
import { useEditableContext } from './use-editable-context'

/**
 * 根据选区 selection 的深度获取当前最顶层选中元素
 * @param element
 * @returns
 */
const useTopSelected = (element: SlateElement) => {
  const editor = useSlate()
  const selected = useSelected()
  const { selection } = editor
  const { selectedDepth } = useEditableContext()!
  const path = useMemo(() => ReactEditor.findPath(editor, element), [editor, element])

  const isSelected = useMemo(() => {
    return (
      path.length === selectedDepth &&
      selected &&
      selection &&
      (editor.isVoid(element) || !Range.isCollapsed(selection))
    )
  }, [selectedDepth, path, selected])

  return isSelected
}

export { useTopSelected }
