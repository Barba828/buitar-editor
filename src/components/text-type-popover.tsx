import { memo, useEffect, FC, useState, useCallback, useMemo } from 'react'
import { useSlate } from 'slate-react'
import { getSelectedRect, Popover, List, ListItem, type CommonPopoverProps } from '~chord'

import { textTypeMenu, tablatureTypeMenu, type ToolType } from './tools.config'

export const TextTypePopover: FC<CommonPopoverProps> = memo(
  ({ visible = true, onVisibleChange }) => {
    const editor = useSlate()
    const [rect, setRect] = useState<DOMRect | null>(null)

    useEffect(() => {
      const selectedRect = getSelectedRect(editor)
      if (!selectedRect || !visible) {
        return
      }

      setRect(selectedRect)
    }, [editor, visible])

    const nestedList = useMemo(() => {
      return [
        {
          title: 'turn into',
          list: textTypeMenu,
        },
        {
          title: 'tablature',
          list: tablatureTypeMenu,
        },
      ]
    }, [])

    const renderItem = useCallback((item: ToolType) => {
      return <ListItem item={item} />
    }, [])

    const onItemClick = useCallback(
      (item: ToolType) => {
        if (item.type === 'text') {
          editor.toggleBlock?.(item.key)
          setRect(null)
          onVisibleChange?.(false)
        }
      },
      [editor, onVisibleChange]
    )

    if (!visible || !rect) {
      return null
    }

    return (
      <Popover data-cy="text-type-portal" rect={rect} onVisibleChange={onVisibleChange}>
        <List nestedLists={nestedList} renderItem={renderItem} onItemClick={onItemClick}></List>
      </Popover>
    )
  }
)
