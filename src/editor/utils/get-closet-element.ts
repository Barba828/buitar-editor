import { Editor, Element as SlateElement } from 'slate'
import { ReactEditor } from 'slate-react'
import { getSelectedNode } from '~common'
import { ONLY_ONE_WRAP_TYPES } from '../plugins/config'

/**
 * 根据 Dom 获取最近的 Element
 * 若父级包含 ONLY_ONE_WRAP_TYPES 则直接返回 wrapElement
 * @param editor
 * @param target
 * @returns
 */
export const getClosetElement = (editor: Editor, target: HTMLElement | EventTarget) => {
  if (!ReactEditor.hasDOMNode(editor, target as HTMLElement)) {
    return
  }
  const targetNode = ReactEditor.toSlateNode(editor, target as HTMLElement)
  if (Editor.isEditor(targetNode)) {
    return
  }
  const targetAt = ReactEditor.findPath(editor, targetNode)

  /**若父级包含 ONLY_ONE_WRAP_TYPES 则直接返回 wrapElement */
  const wrapElement = getSelectedNode(editor, ONLY_ONE_WRAP_TYPES, { at: targetAt })
  if (wrapElement) {
    return wrapElement
  }

  /**若当前targetNode就是 Block 则直接返回targetNode */
  if (SlateElement.isElement(targetNode) && editor.isBlock(targetNode)) {
    return Editor.node(editor, targetAt)
  }

  /**Above向上找到最近的Element显示hovertoolbar */
  const closestElement = Editor.above(editor, {
    at: targetAt,
    match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
  })
  if (closestElement && !Editor.isEditor(closestElement[0])) {
    return closestElement
  }
}
