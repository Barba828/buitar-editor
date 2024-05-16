import { FC, HTMLProps } from 'react'
import { Element as SlateElement } from 'slate'
import { useEmptySelected } from '~common'
import cx from 'classnames'

import './custom-placeholder.scss'
import { textTypeMenuMap } from '../tools.config'

export const Placeholder: FC<{ element: SlateElement } & HTMLProps<HTMLDivElement>> = ({
  element,
  className,
  ...props
}) => {
  const isEmptyElementSelected = useEmptySelected(element)
  console.log('lnz isEmptyElementSelected', isEmptyElementSelected, element)
  // const isEmptyLine = editor.string(currentPath).length === 0

  return (
    isEmptyElementSelected && (
      <span {...props} className={cx('slate-custom-placeholder', 'placeholder', className)}>
        {textTypeMenuMap.get(element.type)?.desc || 'Please Input Text'}
      </span>
    )
  )
}
