import { CustomTypes, Editor, Element as SlateElement, Transforms } from 'slate'
import { isBlockActive, isMarkActive } from '~chord'

const LIST_TYPES = ['numbered-list', 'bulleted-list']
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify']

export const isListFunc = (format: BlockFormat) => LIST_TYPES.includes(format)

export const toggleMark = (editor: Editor, format: TextFormat) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

export const toggleBlock = (editor: Editor, format: BlockFormat) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
  )
  const isList = isListFunc(format)

  /**
   * 先解除 isList 的包裹
   * 避免在 ol/ul 标签内进行格式转换
   */
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

  /**
   * List类型需根据 format 在外部包裹 ol/ul
   * 内部是list-item li
   */
  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block as CustomTypes['Element'])
  }
}

export const withToggle = (editor: Editor) => {
  editor.isList = isListFunc
  editor.toggleBlock = (format) => toggleBlock(editor, format)
  editor.toggleMark = (format) => toggleMark(editor, format)
  return editor
}
