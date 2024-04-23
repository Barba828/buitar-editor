import { FC, useState } from 'react'
import { Editor, Element as SlateElement, Transforms } from 'slate'
import { ReactEditor } from 'slate-react'

import './hover-toolbar.scss'
import { CustomElement } from '../custom-types'

export const useHoverToolbar = (editor: Editor) => {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [closestElement, setClosestElement] = useState<CustomElement | null>(null)

  const handleMouseOver: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.target) {
      const targetNode = ReactEditor.toSlateNode(editor, event.target as HTMLElement)

      const closestElement = Editor.above(editor, {
        at: ReactEditor.findPath(editor, targetNode),
        match: (n) => SlateElement.isElement(n) && !editor.isInline(targetNode as SlateElement),
      })

      // Above向上找到最近的Element显示hovertoolbar
      if (closestElement) {
        setRect(ReactEditor.toDOMNode(editor, closestElement[0]).getBoundingClientRect())
        setClosestElement(closestElement[0] as CustomElement)
      } else {
        setRect(null)
        setClosestElement(null)
      }
    }
  }

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
        <div className="hover-toolbar-item" onClick={handleInsert}>
          +
        </div>
        <div className="hover-toolbar-item">=</div>
        <div className="hover-toolbar-side"></div>
      </div>
    )
  }

  return {
    attrs: {
      handleMouseOver,
    },
    HoverToolbar,
  }
}
