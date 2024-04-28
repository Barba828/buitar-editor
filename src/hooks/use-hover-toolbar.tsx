import { FC, useCallback, useState } from 'react'
import { Editor, Element as SlateElement, Transforms } from 'slate'
import { ReactEditor } from 'slate-react'

import './hover-toolbar.scss'
import { CustomElement } from '../custom-types'

const getClosetElement = (editor: Editor, target: EventTarget) => {
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

export const useHoverToolbar = (editor: Editor) => {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [closestElement, setClosestElement] = useState<CustomElement | null>(null)

  const onMouseOver: React.MouseEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (event.target) {
        const targetNode = getClosetElement(editor, event.target) as SlateElement
        if (targetNode) {
          setClosestElement(targetNode)
          setRect(ReactEditor.toDOMNode(editor, targetNode).getBoundingClientRect())
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
    const end = Editor.end(editor, path)

    Transforms.select(editor, end)
    editor.insertBlock?.({ type: 'paragraph', children: [{ text: '/' }] })
    // editor.insertBreak()
    // editor.insertText('/')
  }

  const HoverToolbar: FC = () => {
    if (!rect) return null
    return (
      <div className="hover-toolbar" style={{ top: rect.top, left: rect.left }}>
        <div className="hover-toolbar-wrapper">
          <div className="hover-toolbar-item" onClick={handleInsert}>
            +
          </div>
          <div className="hover-toolbar-item">T</div>
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
