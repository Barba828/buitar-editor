import { useState, useCallback, useEffect, memo } from 'react'
import { Editor, Path, Transforms, Range } from 'slate'
import { useFocused, ReactEditor, useSlateStatic } from 'slate-react'
import { CustomElement } from '~/custom-types'
import { useEditableContext } from '~/editor/hooks/use-editable-context'
import { getParentNode, Icon } from '~common'

import './hover-toolbar.scss'

/**
 * 获取当前element的rect
 * 若该element属于包裹wrap类型，则获取其第一个子元素的rect
 * @param editor
 * @param targetNode
 * @returns
 */
const getClosetRect = (editor: Editor, targetNode: CustomElement, mouseY: number): DOMRect => {
  const rect = ReactEditor.toDOMNode(editor, targetNode).getBoundingClientRect()
  const isFromTop = Math.abs(rect.top - mouseY) < rect.height / 2 // rect顶部top位置，距离鼠标Y差值小于rect高/2，则认为是从rect上往下移入

  const parent = getParentNode(editor, targetNode)
  if (parent) {
    const parentNode = parent[0] as CustomElement
    if (parentNode.type === 'toogle-list' && targetNode === parentNode.children?.[0]) {
      return {
        ...rect,
        top: rect.top,
        height: rect.height,
        left: rect.left - 30,
      }
    }
  }

  // list-item类型的元素，左侧 marker 占位 20 px
  if (targetNode.type === 'list-item') {
    return {
      ...rect,
      top: rect.top,
      height: rect.height,
      left: rect.left - 20, // list-item左侧距离为20px
    }
  }

  // toogle-list 获取其第一个/最后一个子元素的rect
  if (targetNode.type === 'toogle-list') {
    const leastChild = targetNode.children?.[
      isFromTop ? 0 : targetNode.children.length - 1
    ] as CustomElement
    return getClosetRect(editor, leastChild, mouseY)
  }

  // block-quote 获取其第一个的rect
  if (targetNode.type === 'block-quote') {
    const leastChild = targetNode.children?.[0] as CustomElement
    const _rect = getClosetRect(editor, leastChild, mouseY)
    return {
      ..._rect,
      left: _rect.left - 20,
    }
  }

  if (editor.isVoid(targetNode)) {
    return {
      ...rect,
      top: rect.top,
      height: 30,
      left: rect.left,
    }
  }

  // if (targetNode.type.includes('heading')) {
  //   return {
  //     ...rect,
  //     top: rect.top,
  //     height: 48,
  //     left: rect.left,
  //   }
  // }

  return {
    ...rect,
    top: rect.top,
    height: rect.height,
    left: rect.left,
  }
}

export const HoverToolbar = memo(() => {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const { closestElement, mouseY } = useEditableContext()!
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
    const targetRect = getClosetRect(editor, closestElement, mouseY)
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
    ReactEditor.blur(editor)
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
        <Icon name="icon-add-plus" className="hover-toolbar-item" onMouseDown={handleInsert}></Icon>
        <Icon name="icon-drag" className="hover-toolbar-item" onMouseDown={handleDrag}></Icon>
      </div>
      <div className="hover-toolbar-side"></div>
    </div>
  )
})
