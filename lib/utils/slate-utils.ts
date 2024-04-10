import { CustomTypes, Range, Editor, Element as SlateElement, Text } from 'slate'
import { ReactEditor } from 'slate-react'

type TextFormat = keyof Omit<CustomTypes['Text'], 'text'>

export const isMarkActive = (editor: Editor, format: TextFormat) => {
  const marks = Editor.marks(editor)
  return marks ? !!marks[format] : false
}

export const isBlockActive = (editor: Editor, format: SlateElement['type'], blockType = 'type') => {
  const { selection } = editor
  if (!selection) {
    return false
  }

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType as keyof SlateElement] === format,
    })
  )

  return !!match
}

/**
 * 获取当前 selection 的blockType
 * @param editor
 * @returns
 */
export const getSelectedBlockType = (editor: Editor) => {
  // 获取当前选区的位置
  const { selection } = editor

  if (!selection) {
    return undefined
  }

  const [fisrtNode] = Array.from(
    Editor.nodes(editor, { at: selection, match: SlateElement.isElement })
  )
  return fisrtNode?.[0].type
}

/**
 * 根据 selection 判断选中的是否是paragraph文本内容
 * @param editor
 * @returns
 */
export const isSelectedParagraph = (editor: CustomTypes['Editor']) => {
  return isBlockActive(editor, 'paragraph')
}

/**
 * 根据 selection 获取 选中的所有匹配 format 的 leaf
 * @param editor
 * @param format
 * @returns
 */
export const getSelectedLeavesFormat = (
  editor: CustomTypes['Editor'],
  format: keyof Omit<CustomTypes['Text'], 'text'>
) => {
  const { selection } = editor
  if (!selection) {
    return []
  }

  const leaves = []
  const range = Editor.range(editor, selection)

  for (const [node] of Editor.nodes(editor, { at: range, match: Text.isText })) {
    if (node[format]) {
      leaves.push(node)
    }
  }
  return leaves
}

/**
 * 根据 selection 获取选中的 DOMRect
 * @param editor
 * @returns
 */
export const getSelectedRect = (editor: CustomTypes['Editor']) => {
  const { selection } = editor
  if (!selection || Range.isCollapsed(selection)) {
    return null
  }

  const range = ReactEditor.toDOMRange(editor, selection)
  return range.getBoundingClientRect()
}
