import { useCallback, useEffect, useMemo, useState } from 'react'
import { Editor, Path, Transforms, Element as SlateElement, Range } from 'slate'
import { ReactEditor, useFocused } from 'slate-react'
import { getParentNode, Icon } from '~common'
import { CustomElement } from '~/custom-types'
import { NEED_WRAP_TYPES } from '~/editor/plugins/config'
import { getClosetElement } from '~/editor/utils/get-closet-element'
import { debounce } from '~common/utils/debounce'

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
    const parentNode = parent[0] as SlateElement
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

export const useHoverToolbar = (editor: Editor) => {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [closestElement, setClosestElement] = useState<CustomElement | null>(null)
  const focused = useFocused()

  const cleanHoverToolbar = useCallback(() => {
    setRect(null)
    setClosestElement(null)
  }, [])

  useEffect(() => {
    if (!focused && rect) {
      cleanHoverToolbar()
    }
  }, [focused])

  const onMouseOver: React.MouseEventHandler<HTMLDivElement> = useCallback(
    debounce((event) => {
      if (event.target) {
        const targetNode = getClosetElement(editor, event.target)?.[0] as SlateElement
        if (!targetNode) {
          return
        }
        const targetRect = getClosetRect(editor, targetNode)
        
        if (targetRect && targetNode !== closestElement) {
          setClosestElement(targetNode)
          setRect(targetRect)
        } else if (closestElement) {
          cleanHoverToolbar()
        }
      }
    }, 16),
    [cleanHoverToolbar, editor]
  )

  const onSelectionChange = useCallback(() => {
    const { selection } = editor
    if (!selection || !Range.isCollapsed(selection)) {
      return
    }
    cleanHoverToolbar()
  }, [cleanHoverToolbar, editor])

  const handleInsert = useCallback(() => {
    if (!closestElement) {
      return
    }
    // 定位在当前 element 的末尾插入 新的Element
    const path = ReactEditor.findPath(editor, closestElement)
    const newPath = Path.next(path)

    const newParagraph = { type: 'paragraph', children: [{ text: '/' }] } as SlateElement
    Transforms.insertNodes(editor, newParagraph, { at: newPath })

    // 设置焦点到新段落的末端
    const newSelection = Editor.end(editor, newPath)
    Transforms.select(editor, newSelection)
    ReactEditor.focus(editor)
  }, [editor, closestElement])

  const handleSelect = useCallback(() => {
    if (!closestElement) {
      return
    }
    const path = ReactEditor.findPath(editor, closestElement)
    Transforms.select(editor, path)
  }, [editor, closestElement])

  useEffect(() => {
    window.addEventListener('scroll', cleanHoverToolbar)
    return () => {
      window.removeEventListener('scroll', cleanHoverToolbar)
    }
  }, [cleanHoverToolbar])

  const hoverToolbar = useMemo(() => {
    if (!rect) return null

    return (
      <div className="hover-toolbar" style={{ top: rect.top + rect.height / 2, left: rect.left }}>
        <div className="hover-toolbar-wrapper">
          <Icon name="icon-add-plus" className="hover-toolbar-item" onClick={handleInsert}></Icon>
          <Icon name="icon-drag" className="hover-toolbar-item" onClick={handleSelect}></Icon>
        </div>
        <div className="hover-toolbar-side"></div>
      </div>
    )
  }, [handleInsert, handleSelect, rect])

  return {
    attrs: {
      onMouseOver,
      onSelectionChange,
    },
    hoverToolbar,
  }
}
