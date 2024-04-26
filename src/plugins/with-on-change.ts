import { Transforms, Element as SlateElement, Editor, Range, Point, NodeEntry } from 'slate'
import { getSelectedBlockActive, isBlockActive } from '~common'
import { BlockQuoteElement } from '../custom-types'

const SHORTCUTS: Record<string, BlockFormat> = {
  '*': 'bulleted-list',
  '-': 'bulleted-list',
  '+': 'bulleted-list',
  '>': 'block-quote',
  '```': 'code-block',
  '#': 'heading-1',
  '##': 'heading-2',
  '###': 'heading-3',
  '####': 'heading-4',
  '#####': 'heading-5',
  '######': 'heading-6',
}
const orderedListRegex = /^(\d+)\.$/
/**
 * 从 type 中获取 BlockFormat
 * @param type
 * @returns
 */
const getTypeForMD = (type: string): { type: BlockFormat | null; start?: string } => {
  if (SHORTCUTS[type]) {
    return { type: SHORTCUTS[type] }
  } else {
    const match = type.match(orderedListRegex)
    if (match) {
      const start = match[1]
      return { type: 'numbered-list', start }
    }
  }
  return { type: null }
}

/**换行需要清理格式的类型 */
const clearInBlockType: BlockFormat[] = [
  'heading-1',
  'heading-2',
  'heading-3',
  'heading-4',
  'heading-5',
  'heading-6',
]

export const withOnChange = (editor: Editor) => {
  const { insertText, insertBreak, deleteBackward } = editor

  editor.insertText = (text) => {
    const { selection } = editor
    // 空格结尾，判断是否是markdown标记
    if (text.endsWith(' ') && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection
      const block = Editor.above(editor, {
        match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
      })
      const path = block ? block[1] : []
      const start = Editor.start(editor, path)
      const end = Editor.end(editor, path)
      const range = { anchor, focus: start }

      const beforeText = Editor.string(editor, range) + text.slice(0, -1) // 截取start开始的文本，并去掉最后一位空格
      const afterText = Editor.string(editor, { anchor, focus: end }) // select到结尾的文本，作为 children 插入内容
      const { type, start: orderedListStart } = getTypeForMD(beforeText)

      // abc-tablature 内不支持markdown快捷键
      if (type && !isBlockActive(editor, 'abc-tablature')) {
        Transforms.select(editor, range)

        // 删除原有markdown标记文本（*/-/+/#/....）
        if (!Range.isCollapsed(range)) {
          Transforms.delete(editor)
        }

        const newProperties = {
          type,
          start: orderedListStart ? Number(orderedListStart) : undefined,
        }

        editor.toggleBlock?.({ ...newProperties, children: [{ text: afterText }] })
        return
      }
    }

    insertText(text)
  }

  editor.deleteBackward = (...args) => {
    // 若在段落block开始位置退格，则清除格式（重置为paragraph）
    const isCleaned = cleanTypeOnStart(editor)
    if (isCleaned) {
      return
    }

    deleteBackward(...args)
  }

  editor.insertBreak = (...args) => {
    // 若在段落block开始位置回车，则清除格式（重置为paragraph）
    const isCleaned = cleanTypeOnStart(editor)
    if (isCleaned) {
      return
    }

    insertBreak(...args)

    // 若在段落block有内容位置回车，换行后，判断是否需要清理格式
    const { selection } = editor
    if (selection && Range.isCollapsed(selection)) {
      // 换行清理 heading 等格式
      const matchClosestHeading = Editor.above(editor, {
        match: (n) =>
          SlateElement.isElement(n) &&
          Editor.isBlock(editor, n) &&
          n.type !== 'paragraph' &&
          clearInBlockType.includes(n.type),
      })
      if (matchClosestHeading) {
        const newProperties: Partial<SlateElement> = {
          type: 'paragraph',
        }
        Transforms.setNodes(editor, newProperties)
      }

      // 换行展开 block-quote
      const matchBlockQuote = getSelectedBlockActive(editor, 'block-quote')
      if (matchBlockQuote) {
        const [block, path] = matchBlockQuote
        if (!(block as BlockQuoteElement).extend) {
          Transforms.setNodes(
            editor,
            {
              type: 'block-quote',
              extend: true,
            },
            { at: path }
          )
        }
      }
    }
  }

  return editor
}

/**
 * 判断在当前段落开始位置，若在开始位置，并且当前block不是paragraph，则重置为paragraph
 * @param editor
 * @returns
 */
const cleanTypeOnStart = (editor: Editor) => {
  const { selection } = editor

  if (!selection || !Range.isCollapsed(selection)) {
    return
  }

  const match = Editor.above(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      Editor.isBlock(editor, n) &&
      n.type !== 'paragraph',
  })

  if (!match) {
    return
  }

  const [block, path] = match as NodeEntry<SlateElement>
  const start = Editor.start(editor, path)

  /** start 处于当前block开始位置 */
  if (!Point.equals(selection.anchor, start)) {
    return
  }

  /**当前block不是paragraph，则重置为paragraph */
  Transforms.setNodes(editor, { type: 'paragraph' }, { at: path })
  /**当前是list-item，则解除ol/ul包裹 */
  if (block.type === 'list-item') {
    Transforms.unwrapNodes(editor, {
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && !!editor.isList?.(n.type),
      split: true,
    })
  }
  return true
}

// /**
//  * 判断当前列表项是否还有外部的有序列表或无序列表包裹
//  * @param editor
//  * @param listItemPath
//  * @returns
//  */
// const hasListWrapper = (editor: Editor, listItemPath: Path) => {
//   const [parent] = Editor.node(editor, listItemPath.slice(0, -1)) // 获取列表项的父节点

//   if (!parent || !SlateElement.isElement(parent)) {
//     return false // 如果父节点不存在或不是元素节点，直接返回 false
//   }

//   if (editor.isList?.(parent.type)) {
//     return parent // 如果父节点是列表类型，则说明当前列表项有外部列表包裹，返回 true
//   }

//   // 递归向上遍历父节点的祖先节点，继续判断是否有外部列表包裹
//   return hasListWrapper(editor, listItemPath.slice(0, -1))
// }
