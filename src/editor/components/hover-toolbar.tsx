import { useState, useCallback, useEffect, memo } from 'react'
import { Editor, Path, Transforms, Range } from 'slate'
import { useFocused, ReactEditor, useSlateStatic } from 'slate-react'
import { CustomElement } from '~/custom-types'
import { useEditableContext } from '~/editor/hooks/use-editable-context'
import { getParentNode, Icon } from '~common'
import { NEED_WRAP_TYPES } from '~/editor/plugins/config'

import './hover-toolbar.scss'

/**
 * 获取当前element的rect
 * 若该element属于包裹wrap类型，则获取其第一个子元素的rect
 * @param editor
 * @param targetNode
 * @returns
 */
const getClosetRect = (editor: Editor, targetNode: CustomElement) => {
  const rect = ReactEditor.toDOMNode(editor, targetNode).getBoundingClientRect()
  if (targetNode.type === 'list-item') {
    return {
      ...rect,
      top: rect.top,
      height: rect.height || 40,
      left: rect.left - 16,
    }
  }
  if (targetNode.type === 'gtp-previewer' || NEED_WRAP_TYPES.includes(targetNode.type)) {
    return {
      ...rect,
      top: rect.top,
      height: 40,
      left: rect.left,
    }
  }

  const parent = getParentNode(editor, targetNode)
  if (parent) {
    const parentNode = parent[0] as CustomElement
    if (parentNode.type === 'toogle-list' && targetNode === parentNode.children?.[0]) {
      return {
        ...rect,
        top: rect.top,
        height: rect.height,
        left: rect.left - 20,
      }
    }
  }

  return rect
}

export const HoverToolbar = memo(() => {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const { closestElement } = useEditableContext()!
  const editor = useSlateStatic()
  const { selection } = editor
  const focused = useFocused()

  const cleanHoverToolbar = useCallback(() => {
    setRect(null)
  }, [])

  useEffect(() => {
    if (selection && Range.isCollapsed(selection) && rect) {
      cleanHoverToolbar()
    }
  }, [selection])

  useEffect(() => {
    if (!closestElement) {
      cleanHoverToolbar()
      return
    }
    const targetRect = getClosetRect(editor, closestElement)
    if (targetRect) {
      setRect(targetRect)
    } else if (closestElement) {
      cleanHoverToolbar()
    }
  }, [closestElement])

  useEffect(() => {
    if (!focused && rect) {
      cleanHoverToolbar()
    }
  }, [focused])

  const handleInsert = useCallback(() => {
    if (!closestElement) {
      return
    }
    // 定位在当前 element 的末尾插入 新的Element
    const path = ReactEditor.findPath(editor, closestElement)
    const newPath = Path.next(path)

    const newParagraph = { type: 'paragraph', children: [{ text: '/' }] } as CustomElement
    Transforms.insertNodes(editor, newParagraph, { at: newPath })

    // 设置焦点到新段落的末端
    const newSelection = Editor.end(editor, newPath)
    Transforms.select(editor, newSelection)
    ReactEditor.focus(editor)
  }, [editor, closestElement])

  const handleDrag = useCallback(() => {
    if (!closestElement) {
      return
    }
    const path = ReactEditor.findPath(editor, closestElement)
    Transforms.select(editor, path)
  }, [editor, closestElement])

  useEffect(() => {
    const scrollView = document.querySelector('#slate-editable')?.parentElement
    if (scrollView) {
      scrollView.addEventListener('scroll', cleanHoverToolbar)
    }
    return () => {
      if (scrollView) {
        scrollView.removeEventListener('scroll', cleanHoverToolbar)
      }
    }
  }, [cleanHoverToolbar])

  if (!rect) return null

  return (
    <div className="hover-toolbar" style={{ top: rect.top + rect.height / 2, left: rect.left }}>
      <div className="hover-toolbar-wrapper">
        <Icon name="icon-add-plus" className="hover-toolbar-item" onClick={handleInsert}></Icon>
        <Icon name="icon-drag" className="hover-toolbar-item" onClick={handleDrag}></Icon>
      </div>
      <div className="hover-toolbar-side"></div>
    </div>
  )
})
