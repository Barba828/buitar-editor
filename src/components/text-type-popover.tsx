import { memo, useEffect, FC, useState, useCallback, useMemo } from 'react'
import { useSlate } from 'slate-react'
import { getSelectedRect, Popover, List, BlockFormat } from '../../lib'

import { textTypeMenu, chordTypeMenu } from './text-type.config'

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

    const renderItem = (item: (typeof textTypeMenu)[0], index: number) => {
      return (
        <div key={index} className="toolbar-chord-item">
          <div className="toolbar-chord-item--title">{item.title}</div>
          <div className="toolbar-chord-item--desc">{item.desc}</div>
        </div>
      )
    }

    const onItemClick = useCallback(
      (item: (typeof textTypeMenu)[0]) => {
        if (item.type === 'text') {
          editor.toggleBlock?.(item.key as BlockFormat)
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
