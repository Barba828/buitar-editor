import { Editor, Element as SlateElement, Transforms } from 'slate'
import { isBlockActive, isMarkActive } from '~common'

const LIST_TYPES: BlockFormat[] = ['numbered-list', 'bulleted-list']
const NEED_WRAP_TYPES: BlockFormat[] = [...LIST_TYPES, 'block-quote', 'abc-tablature']

export const isListFunc = (format: BlockFormat) => LIST_TYPES.includes(format)

export const toggleMark = (editor: Editor, format: TextFormat) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

export const toggleBlock = (editor: Editor, { type: format }: SlateElement) => {
  const isActive = isBlockActive(editor, format)
  const isNeedWrap = NEED_WRAP_TYPES.includes(format)

  /**
   * 先解除 isList 的包裹
   * 避免在 ol/ul 标签内进行格式转换
   */
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && NEED_WRAP_TYPES.includes(n.type),
    split: true,
  })

  let newProperties: Partial<SlateElement> = {
    type: 'paragraph',
  }

  if (!isActive) {
    switch (format) {
      case 'numbered-list':
      case 'bulleted-list':
        newProperties = {
          type: 'list-item',
        }
        break
      case 'block-quote':
      case 'abc-tablature':
        newProperties = {
          type: 'paragraph',
        }
        break
      default:
        newProperties = { type: format }
    }
  }

  Transforms.setNodes<SlateElement>(editor, newProperties)

  /**
   * List类型需根据 format 在外部还原包裹 ol/ul
   * 内部是list-item li
   */
  if (!isActive && isNeedWrap) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block as SlateElement)
  }
}

export const insertBlock = (editor: Editor, element: SlateElement) => {
  let node = {
    ...element,
    children: [{ text: '' }],
  } as SlateElement

  switch (element.type) {
    case 'numbered-list':
    case 'bulleted-list':
      node = {
        ...element,
        children: [
          {
            type: 'list-item',
            children: [{ text: '' }],
          },
        ],
      }
      break
    case 'block-quote':
      node = {
        ...element,
        children: [
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
        ],
      }
      break
    default:
      break
  }
  Transforms.insertNodes(editor, node)
}

export const withToggle = (editor: Editor) => {
  editor.isList = isListFunc
  editor.toggleMark = (format) => toggleMark(editor, format)
  editor.toggleBlock = (element) => toggleBlock(editor, element as SlateElement)
  editor.insertBlock = (element) => insertBlock(editor, element as SlateElement)
  return editor
}
