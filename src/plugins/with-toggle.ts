import { Editor, Element as SlateElement, Transforms, Node } from 'slate'
import { isBlockActive, isMarkActive } from '~common'
import { LIST_TYPES, NEED_WRAP_TYPES, OTHER_WRAP_TYPES } from './config'
import { NodeInsertNodesOptions } from 'slate/dist/interfaces/transforms/node'

export const isListFunc = (format: BlockFormat) => LIST_TYPES.includes(format)

export const toggleMark = (editor: Editor, format: TextFormat) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

/**
 *
 * @param editor
 * @param element
 * @param options
 */
export const toggleBlock = (
  editor: Editor,
  element: SlateElement,
  options?: {
    /**固定将block设置为active */
    ignoreActive?: boolean
  }
) => {
  const { type: format } = element
  const { ignoreActive = false } = options || {}
  const isNeedWrap = NEED_WRAP_TYPES.includes(format)
  const isActive = ignoreActive ? false : isBlockActive(editor, format)

  /**
   * @todo
   * ONLY_ONE_WRAP_TYPES toggle行为：选取整个wrap block 进行 toggle
   */

  /**
   * 解除包裹
   * 1.父级有List包裹先解除 List 的包裹，避免在 ol/ul 标签内进行格式转换
   * 2.父级有OTHER_WRAP包裹，并且format也属于OTHER_WRAP & isActive，需要解除包裹
   */
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      (LIST_TYPES.includes(n.type) ||
        (OTHER_WRAP_TYPES.includes(n.type) && n.type === format && isActive)),
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
      case 'toogle-list':
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
   * 增加包裹
   * 1. List类型需根据 format 在外部还原包裹 ol/ul（内部是list-item li）
   * 2. block-quote 外部包裹 block （内部是 paragraph p）
   */
  if (!isActive && isNeedWrap) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block as SlateElement)
  }
}

export const insertBlock = (
  editor: Editor,
  element: SlateElement,
  options?: NodeInsertNodesOptions<Node>
) => {
  const { selection } = editor
  if (!selection) return
  const [, currentPath] = Editor.node(editor, selection)

  /**
   * @todo
   * ONLY_ONE_WRAP_TYPES 插入行为：1.return 2.插入父级新行 3.能在当前插入
   */
  
  /** 位于行首直接toggle当前block */
  if (Editor.string(editor, currentPath).length === 0) {
    editor.toggleBlock?.(element, { ignoreActive: true })
    return
  }

  let newProperties = {
    children: [{ text: '' }],
    ...element,
  } as SlateElement
  /**
   * 更新node 插入block
   */
  switch (element.type) {
    case 'numbered-list':
    case 'bulleted-list':
      newProperties = {
        ...element,
        children: [
          {
            type: 'list-item',
            children: element.children || [{ text: '' }],
          },
        ],
      }
      break
    case 'block-quote':
    case 'toogle-list':
    case 'abc-tablature':
      newProperties = {
        ...element,
        children: [
          {
            type: 'paragraph',
            children: element.children || [{ text: '' }],
          },
        ],
      }
      break
    default:
      break
  }
  Transforms.insertNodes(editor, newProperties, options)
}

export const withToggle = (editor: Editor) => {
  editor.isList = isListFunc
  editor.toggleMark = (format) => toggleMark(editor, format)
  editor.toggleBlock = (element, options) => toggleBlock(editor, element as SlateElement, options)
  editor.insertBlock = (element) => insertBlock(editor, element as SlateElement)
  return editor
}
