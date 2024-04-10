import { memo, useEffect, FC, useState, useCallback, useMemo } from 'react'
import { useSlate } from 'slate-react'
import { getSelectedRect, Popover, List, ListItem } from '~chord'

import { textTypeMenu, chordTypeMenu, type ToolType } from './tools.config'

interface TextTypePopoverProps {
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
}
export const TextTypePopover: FC<TextTypePopoverProps> = memo(
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
          title: 'music',
          list: chordTypeMenu,
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
