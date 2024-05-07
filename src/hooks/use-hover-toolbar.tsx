import { FC, useCallback, useEffect, useState } from 'react'
import { Editor, Path, Transforms, Element as SlateElement } from 'slate'
import { ReactEditor } from 'slate-react'
import { getClosetElement, Icon } from '~common'

import './hover-toolbar.scss'
import { CustomElement } from '../custom-types'
import { NEED_WRAP_TYPES } from '../plugins/config'

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
    return  {
      ...rect,
      top: rect.top,
      height: rect.height || 40,
      left: rect.left - 10,
    }
    
  }
  if (NEED_WRAP_TYPES.includes(targetNode.type) && targetNode?.children?.length) {
    const childrenRect = ReactEditor.toDOMNode(
      editor,
      targetNode.children[0]
    ).getBoundingClientRect()
    return {
      ...rect,
      top: childrenRect.top || rect.top,
      height: childrenRect.height || 40,
      left: rect.left,
    }
  }
  return rect
}

export const useHoverToolbar = (editor: Editor) => {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [closestElement, setClosestElement] = useState<CustomElement | null>(null)

  const onMouseOver: React.MouseEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (event.target) {
        const targetNode = getClosetElement(editor, event.target)?.[0] as SlateElement
        if (!targetNode) {
          return
        }

        const targetRect = getClosetRect(editor, targetNode)
        if (targetRect) {
          setClosestElement(targetNode)
          setRect(targetRect)
        } else {
          setClosestElement(null)
          setRect(null)
        }
      }
    },
    [editor]
  )

  const onInput = useCallback(() => {
    setRect(null)
    setClosestElement(null)
  }, [])

  const handleInsert = () => {
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
  }

  const hideToolbar = useCallback(() => {
    setRect(null)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', hideToolbar)
    return () => {
      window.removeEventListener('scroll', hideToolbar)
    }
  }, [hideToolbar])

  const HoverToolbar: FC = () => {
    if (!rect) return null
    return (
      <div className="hover-toolbar" style={{ top: rect.top + rect.height / 2, left: rect.left }}>
        <div className="hover-toolbar-wrapper">
          <Icon name="icon-add-plus" className="hover-toolbar-item" onClick={handleInsert}></Icon>
          <Icon name="icon-drag" className="hover-toolbar-item"></Icon>
        </div>
        <div className="hover-toolbar-side"></div>
      </div>
    )
  }

  return {
    attrs: {
      onMouseOver,
      onInput,
    },
    HoverToolbar,
  }
}
