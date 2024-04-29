import { FC, useCallback, useEffect, useState } from 'react'
import { ReactEditor, RenderElementProps, useSlateStatic } from 'slate-react'
import { ToggleListElement, CustomElement } from '../../custom-types'
import { Transforms, Element as SlateElement } from 'slate'
import { Icon } from '~common'

import './toggle-list-item.scss'

const deepFirstChildren = (node: SlateElement): CustomElement => {
  if (node.children?.length && SlateElement.isElement(node.children[0])) {
    return deepFirstChildren(node.children[0])
  }
  return node
}

export const ToggleListItem: FC<RenderElementProps> = ({ attributes, children, element }) => {
  const { extend = true } = element as ToggleListElement
  const editor = useSlateStatic()
  const [firstChildHeight, setFirstChildHeight] = useState(0)

  useEffect(() => {
    try {
      // 获取 ToggleList 第一个子Element元素
      const firstChild = deepFirstChildren(element)
      const firstDomNode = ReactEditor.toDOMNode(editor, firstChild)
      // 设置未展开高度
      const style = window.getComputedStyle(firstDomNode)
      const marginTop = parseFloat(style.marginTop)
      const marginBottom = parseFloat(style.marginBottom)
      setFirstChildHeight(firstDomNode.getBoundingClientRect().height + marginTop + marginBottom)
    } catch (e) {
      /* empty */
    }
  }, [editor, element])

  const handleTriggerClick = useCallback(() => {
    Transforms.setNodes(editor, { extend: !extend }, { at: ReactEditor.findPath(editor, element) })
  }, [editor, element, extend])

  return (
    <div className="toggle-list-item" {...attributes}>
      <div
        className="toggle-list-item__content"
        style={{ height: firstChildHeight && !extend ? `${firstChildHeight}px` : 'auto' }}
      >
        {children}
      </div>
      <div
        className="toggle-list-item__trigger flex-center"
        contentEditable={false}
        onClick={handleTriggerClick}
        style={{
          height: firstChildHeight ? `${firstChildHeight}px` : '1em',
        }}
      >
        <Icon name="icon-trigger"   
          style={{
            transform: `rotate(${extend ? 0 : -90}deg)`,
          }}/>
      </div>
    </div>
  )
}
