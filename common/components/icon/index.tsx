// src/components/IconComponent
import { FC } from 'react'
import cx from 'classnames'
import './iconfont.js'

import './icon.scss'

interface IconProps extends React.SVGProps<SVGSVGElement> {
	name: string
	size?: number | string
	color?: string
	className?: string
}

export const Icon: FC<IconProps> = ({ name, size = '1em', color, className, ...restProps }) => {
  const style = { width: size, height: size, color: color, ...restProps?.style }

  return (
    <svg className={cx('icon', name, className)} {...restProps} style={style} aria-hidden="true">
      <use xlinkHref={`#${name}`}></use>
    </svg>
  )
}
