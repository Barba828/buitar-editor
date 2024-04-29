import { FC, HTMLProps } from 'react'
import cx from 'classnames'

import './selector.scss'

export const Selector: FC<
  HTMLProps<HTMLSelectElement> & { lists: Array<{ key: string; value?: string }> }
> = ({ lists, ...props }) => {
  return (
    <select contentEditable={false} {...props} className={cx('chord-selector', props.className)}>
      {lists.map((item) => (
        <option key={item.key} value={item.key}>
          {item.value || item.key}
        </option>
      ))}
    </select>
  )
}
