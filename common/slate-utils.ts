import {
  CustomTypes,
  Range,
  Editor,
  Element as SlateElement,
  Text,
  Node,
  EditorNodesOptions,
} from 'slate'
import { ReactEditor } from 'slate-react'

type TextFormat = keyof Omit<CustomTypes['Text'], 'text'>

export const isMarkActive = (editor: Editor, format: TextFormat) => {
  const marks = Editor.marks(editor)
  return marks ? !!marks[format] : false
}

export const isBlockActive = (
  editor: Editor,
  format: SlateElement['type'] | SlateElement['type'][],
  options?: EditorNodesOptions<Node>
) => {
  return !!getSelectedBlockActive(editor, format, options)
}

/**
 * 获取当前 selection 中符合format的block
 * 不使用 above 是因为 selection 可能包含多个且多层 element
 * @param editor
 * @param format
 * @returns
 */
export const getSelectedBlockActive = (
  editor: Editor,
  format: SlateElement['type'] | SlateElement['type'][],
  options?: EditorNodesOptions<Node>
) => {
  const { selection } = editor
  if (!selection) {
    return null
  }

  const nodes = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => {
        if (Editor.isEditor(n) || !SlateElement.isElement(n)) {
          return false
        }
        const matchFormat = typeof format === 'string' ? n.type === format : format.includes(n.type)
        return matchFormat
      },
      ...options,
    })
  )

  // const match = nodes.find(([node]) => (node as SlateElement).type === format)
  // return match
  return nodes[0]
}

/**
 * 自顶而下获取当前 selection 最后一层的block
 * @param editor
 * @returns
 */
export const getSelectedBlock = (editor: Editor) => {
  // 获取当前选区的位置
  const { selection } = editor

  if (!selection) {
    return null
  }

  const match = Editor.above(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      Editor.isBlock(editor, n) &&
      n.type !== 'paragraph' &&
      n.type !== 'list-item',
  })

  if (match) {
    return match[0] as SlateElement
  }

  return null
}

/**
 * 获取最近的Element
 * @param editor 
 * @param target 
 * @returns 
 */
export const getClosetElement = (editor: Editor, target: EventTarget) => {
  const targetNode = ReactEditor.toSlateNode(editor, target as HTMLElement)

  if (Editor.isEditor(targetNode)) {
    return
  }

  if (SlateElement.isElement(targetNode) && editor.isBlock(targetNode)) {
    return targetNode
  }

  const closestElement = Editor.above(editor, {
    at: ReactEditor.findPath(editor, targetNode),
    match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
  })

  // Above向上找到最近的Element显示hovertoolbar
  if (closestElement && !Editor.isEditor(closestElement[0])) {
    return closestElement[0]
  }
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

  const [start] = Range.edges(selection)
  const range = ReactEditor.toDOMRange(editor, Editor.range(editor, start))
  return range.getBoundingClientRect()
}

/**
 * 获取node的文本（带换行/n）
 * @param element
 * @returns
 */
export const getElementText = (element: SlateElement) => {
  return Array.from(Node.texts(element))
    .map(([node, path]) => (path[path.length - 1] > 0 ? '' : '\n') + node.text)
    .join('')
    .trim()
}
