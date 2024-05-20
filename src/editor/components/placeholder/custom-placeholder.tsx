import { FC, HTMLProps, memo } from 'react'
import { Element as SlateElement } from 'slate'
import { useEmptySelected } from '~common'
import { useBlockType } from '~/editor/hooks/use-block-type'
import cx from 'classnames'

import './custom-placeholder.scss'

export const Placeholder: FC<
  { element: SlateElement } & HTMLProps<HTMLDivElement> & { text?: string }
> = memo(({ element, className, text, ...props }) => {
  const isEmptyElementSelected = useEmptySelected(element)
  const { selectType } = useBlockType()
  
  return (
    isEmptyElementSelected && (
      <span
        {...props}
        contentEditable={false}
        suppressContentEditableWarning
        className={cx('slate-custom-placeholder', 'placeholder', className)}
      >
        {selectType.desc || text || 'Please Input Text'}
      </span>
    )
  )
})
