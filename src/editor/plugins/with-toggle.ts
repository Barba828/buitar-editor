import { Editor, Element as SlateElement, Transforms, Path } from 'slate'
import { getSelectedNode, isBlockActive, isMarkActive } from '~common'
import { LIST_TYPES, NEED_WRAP_TYPES, ONLY_ONE_WRAP_TYPES, OTHER_WRAP_TYPES } from './config'
import { ReactEditor } from 'slate-react'
import { InsertNodesOptions, SetNodesOptions } from '~/custom-types'

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
  options: {
    /**手动设置block的目的active状态 */
    toActive?: boolean
  } & SetNodesOptions = {}
) => {
  const { type: format } = element
  const { toActive, ...setOptions } = options || {}
  const isNeedWrap = NEED_WRAP_TYPES.includes(format)
  const isOnlyOneWrap = ONLY_ONE_WRAP_TYPES.includes(format)
  const isActive = toActive !== undefined ? !toActive : isBlockActive(editor, format)

  /** ONLY_ONE_WRAP_TYPES toggle行为：选取整个wrap block 进行 toggle */
  if (isOnlyOneWrap) {
    const aboveElementMatch = getSelectedNode(editor, element.type)
    if (aboveElementMatch) {
      const [, abovePath] = aboveElementMatch
      setOptions.at = abovePath
    }
  }

  /**
   * 解除包裹，不管是否 isNeedWrap 都需要先解除包裹再转换
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
      // LIST_TYPES
      case 'numbered-list':
      case 'bulleted-list':
        newProperties = {
          type: 'list-item',
        }
        break
      // OTHER_WRAP_TYPES
      case 'block-quote':
      case 'toogle-list':
      case 'abc-tablature':
      case 'block-tablature':
        newProperties = {
          type: 'paragraph',
        }
        break
      default:
        newProperties = { type: format }
    }
  }

  Transforms.setNodes<SlateElement>(editor, newProperties, setOptions)

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
  options: InsertNodesOptions = {}
) => {
  const { selection } = editor
  if (!selection) return
  const [, currentPath] = Editor.node(editor, selection)
  const isEmptyLine = Editor.string(editor, currentPath).length === 0

  /** 在ListItem节点插入，则需要到其父级List节点insert */
  if (isBlockActive(editor, LIST_TYPES)) {
    const aboveElementMatch = getSelectedNode(editor, LIST_TYPES)
    if (aboveElementMatch) {
      const [, abovePath] = aboveElementMatch
      options.at = Path.next(abovePath)
    }
  }

  /** 插入仅允许一层包裹的Block，判断当前是否在该Block下，若是，则到Block兄弟节点insert */
  if (ONLY_ONE_WRAP_TYPES.includes(element.type)) {
    const aboveElementMatch = getSelectedNode(editor, element.type)
    if (aboveElementMatch) {
      const [, abovePath] = aboveElementMatch
      options.at = Path.next(abovePath)
    }
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

  /** 位于行首删除当前wrap内行 */
  if (isEmptyLine) {
    Transforms.removeNodes(editor, { at: currentPath.slice(0, -1) })
  }

  /** 存在at，则焦点更新到at末尾 */
  if (options.at) {
    const newSelection = Editor.end(editor, options.at)
    Transforms.select(editor, newSelection)
  }
  ReactEditor.focus(editor)
}

export const withToggle = (editor: Editor) => {
  editor.isList = isListFunc
  editor.toggleMark = (format) => toggleMark(editor, format)
  editor.toggleBlock = (element, options) => toggleBlock(editor, element as SlateElement, options)
  editor.insertBlock = (element, options) => insertBlock(editor, element as SlateElement, options)
  return editor
}
