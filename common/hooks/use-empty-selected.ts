import { Element } from 'slate'
import { useFocused, useSelected, useSlateStatic } from 'slate-react'

export const useEmptySelected = (element: Element) => {
  const editor = useSlateStatic()
  const focused = useFocused()
  const selected = useSelected()
  const isEmptyElementSelected = selected && focused && editor.isEmpty(element)

  return isEmptyElementSelected
}
