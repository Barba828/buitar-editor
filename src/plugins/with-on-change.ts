import { Transforms, Element as SlateElement, Editor, Range, Point, NodeEntry } from 'slate'
import { getSelectedBlockActive, isBlockActive } from '~common'
import { ToggleListElement } from '../custom-types'
import { NEED_WRAP_TYPES, NONE_RICH_WRAP_TYPES, ONLY_ONE_WRAP_TYPES } from './config'

const SHORTCUTS: Record<string, BlockFormat> = {
  '*': 'bulleted-list',
  '-': 'bulleted-list',
  '+': 'bulleted-list',
  '>': 'block-quote',
  '>>': 'toogle-list',
  '```': 'code-block',
  '#': 'heading-1',
  '##': 'heading-2',
  '###': 'heading-3',
  '####': 'heading-4',
  '#####': 'heading-5',
  '######': 'heading-6',
}

const orderedListRegex = /^(\d+)\.$/

/**换行需要清理格式的类型 */
const clearInBlockType: BlockFormat[] = [
  'heading-1',
  'heading-2',
  'heading-3',
  'heading-4',
  'heading-5',
  'heading-6',
]

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

/**
 * 通过文本获取 BlockProperties
 * @param editor
 * @param text
 * @returns
 */
const insertPropertiesByText = (editor: Editor, text: string) => {
  const { type, start: orderedListStart } = getTypeForMD(text)

  if (!type) {
    return
  }

  // 仅允许一层包裹且已被包裹里，不允许新增
  if (ONLY_ONE_WRAP_TYPES.includes(type) && isBlockActive(editor, type)) {
    return
  }

  const newProperties = {
    type,
    start: orderedListStart ? Number(orderedListStart) : undefined,
  }

  return newProperties
}

export const withOnChange = (editor: Editor) => {
  const { insertText, insertBreak, deleteBackward, insertFragmentData, insertTextData } = editor

  editor.insertText = (text) => {
    const { selection } = editor
    /**
     * 1. 空格结尾，判断是否是markdown标记
     * 2. 非 ONLY_ONE_WRAP_TYPES 内部
     */
    if (
      text.endsWith(' ') &&
      selection &&
      Range.isCollapsed(selection) &&
      !isBlockActive(editor, NONE_RICH_WRAP_TYPES)
    ) {
      const { anchor } = selection
      const match = Editor.above(editor, {
        match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
      })
      const path = match ? match[1] : []
      const start = Editor.start(editor, path)
      const range = { anchor, focus: start }
      const beforeText = Editor.string(editor, range) + text.slice(0, -1) // 截取start开始的文本，并去掉最后一位空格

      // 获取当前上下文能否插入Block
      const newProperties = insertPropertiesByText(editor, beforeText)
      if (newProperties) {
        // 删除原有markdown标记文本（*/-/+/#/....）
        Transforms.select(editor, range)
        if (!Range.isCollapsed(range)) {
          Transforms.delete(editor)
        }
        editor.toggleBlock?.({ ...newProperties }, { toActive: true })
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

      // 换行展开 toogle-list -> extend
      const matchBlockQuote = getSelectedBlockActive(editor, 'toogle-list')
      if (matchBlockQuote) {
        const [block, path] = matchBlockQuote
        if (!(block as ToggleListElement).extend) {
          Transforms.setNodes(
            editor,
            {
              type: 'toogle-list',
              extend: true,
            },
            { at: path }
          )
        }
      }
    }
  }

  editor.insertFragmentData = (data) => {
    // const fragment = data.getData('application/x-slate-fragment');
    // const text = data.getData('text/plain');
    // const html = data.getData('text/html')

    /**如果在 NONE_RICH_WRAP_TYPES 进行粘贴插入，则只能插入文本 */
    /**
     * TODO
     * ONLY_ONE_WRAP_TYPES (block-quote)粘贴时，需要判断data内是否含有block-quote，否则需要清理格式
     */
    if (isBlockActive(editor, NONE_RICH_WRAP_TYPES)) {
      return insertTextData(data)
    }
    return insertFragmentData(data)
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
      !NONE_RICH_WRAP_TYPES.includes(n.type) &&
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

  if (NEED_WRAP_TYPES.includes(block.type)) {
    /**当前 block 属于 NEED_WRAP_TYPES，则 unwrapNodes */
    Transforms.unwrapNodes(editor, {
      at: path,
      split: true,
    })
  } else {
    /**当前 block 为非 paragraph 富文本，则重置为paragraph */
    Transforms.setNodes(editor, { type: 'paragraph' }, { at: path })
    /**当前是list-item，则解除该item项ol/ul包裹 */
    if (block.type === 'list-item') {
      Transforms.unwrapNodes(editor, {
        at: path,
        match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && !!editor.isList?.(n.type),
        split: true,
      })
    }
  }
  return true
}
