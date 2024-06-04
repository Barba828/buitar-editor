import { FC, HTMLProps } from 'react'
import { Transforms, Element as SlateElement } from 'slate'
import { RenderElementProps, useSlateStatic, useReadOnly, ReactEditor } from 'slate-react'
import { type CheckListItemElement as CheckListItemElementType } from '~/custom-types'

import cx from 'classnames'
import './check-list-item.scss'
import { Placeholder } from '../placeholder/custom-placeholder'

export const CheckListItemElement: FC<RenderElementProps & HTMLProps<HTMLDivElement>> = ({
  attributes,
  children,
  element,
  ...divProps
}) => {
  const editor = useSlateStatic()
  const readOnly = useReadOnly()
  const { checked } = element as CheckListItemElementType
  return (
    <div
      {...attributes}
      {...divProps}
      className={cx('check-list-item', { 'check-list-item--checked': checked }, divProps.className)}
    >
      <span contentEditable={false} className="check-list-item__checkbox">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => {
            const path = ReactEditor.findPath(editor, element)
            const newProperties: Partial<SlateElement> = {
              checked: event.target.checked,
            }
            Transforms.setNodes(editor, newProperties, { at: path })
          }}
        />
      </span>
      <span
        className={cx('check-list-item__text')}
        contentEditable={!readOnly}
        suppressContentEditableWarning
      >
        {children}
      </span>

      <Placeholder element={element} className="check-list-item__placeholder" />
    </div>
  )
}
