import { Element, Range } from 'slate'
import { useFocused, useSelected, useSlateStatic } from 'slate-react'

/**
 * 检查选中的元素是否为空
 * @param element 
 * @returns 
 */
export const useEmptySelected = (element: Element) => {
  const editor = useSlateStatic()
  const focused = useFocused()
  const selected = useSelected()
  const { selection } = editor
  
  const isEmptyElementSelected =
    selection && Range.isCollapsed(selection) && selected && focused && editor.isEmpty(element)

  return isEmptyElementSelected
}
