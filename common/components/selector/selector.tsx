import { ChangeEvent, HTMLProps, useCallback } from 'react'
import cx from 'classnames'

import './selector.scss'

export interface SelectorItem<T> {
  value: T
  label?: string
  selected?: boolean
}

export const Selector = <T,>({
  lists,
  className,
  onChange,
  ...props
}: Omit<HTMLProps<HTMLSelectElement>, 'onChange'> & {
  lists: Array<SelectorItem<T>>
  onChange?: (item: SelectorItem<T>, index?: number) => void
}) => {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const index = e.target.selectedIndex
      const selectedItem = lists[index]
      onChange?.(selectedItem, index)
    },
    [onChange, lists]
  )
  return (
    <select
      contentEditable={false}
      {...props}
      onChange={handleChange}
      className={cx('chord-selector', className)}
    >
      {lists.map((item) => (
        <option
          key={item.label}
          value={item.label}
        >
          {item.label || String(item.value)}
        </option>
      ))}
    </select>
  )
}
