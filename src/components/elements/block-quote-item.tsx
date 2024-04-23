import { FC, useCallback } from 'react'
import { ReactEditor, RenderElementProps, useSlateStatic } from 'slate-react'
import { BlockQuoteElement } from '../../custom-types'
import { Transforms } from 'slate'

import './block-quote-item.scss'

export const BlockQuoteItem: FC<RenderElementProps> = ({ attributes, children, element }) => {
  const { extend } = element as BlockQuoteElement
  const [firstChild, ...restChildren] = children
  const editor = useSlateStatic()

  const handleTriggerClick = useCallback(() => {
    Transforms.setNodes(editor, { extend: !extend }, { at: ReactEditor.findPath(editor, element) })
  }, [editor, element, extend])

  return (
    <blockquote className="block-quote-item" {...attributes}>
      <div className="block-quote-item__header">
        <div
          className="block-quote-item__trigger"
          contentEditable={false}
          onClick={handleTriggerClick}
          style={{ transform: `rotate(${extend ? 90 : 0}deg)` }}
        >
          {'>'}
        </div>
        <div>{firstChild}</div>
      </div>
      <div style={{ display: extend ? 'block' : 'none' }}>{restChildren}</div>
    </blockquote>
  )
}
