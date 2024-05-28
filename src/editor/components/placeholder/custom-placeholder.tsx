import { FC, HTMLProps, memo } from 'react'
import { Element as SlateElement } from 'slate'
import { useEmptySelected } from '~common'
import { useBlockType } from '~/editor/hooks/use-block-type'
import cx from 'classnames'

import './custom-placeholder.scss'
import { useEditableContext } from '~/editor/hooks/use-editable-context'

export const Placeholder: FC<
  { element: SlateElement } & HTMLProps<HTMLDivElement> & { text?: string }
> = memo(({ element, className, text, ...props }) => {
  const { imeComposing } = useEditableContext()!
  const isEmptyElementSelected = useEmptySelected(element)
  const { selectType } = useBlockType()

  if (imeComposing) {
    return null
  }

  if (!isEmptyElementSelected) {
    return null
  }

  return (
    <span
      {...props}
      contentEditable={false}
      suppressContentEditableWarning
      className={cx('slate-custom-placeholder', 'placeholder', className)}
    >
      {selectType.desc || text || 'Please Input Text'}
    </span>
  )
})
