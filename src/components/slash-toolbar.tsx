import { useState, useMemo, useEffect, useCallback, FC, HTMLProps } from 'react'
import { Range, Editor, BaseOperation, Transforms } from 'slate'
import { ReactEditor, useSlate } from 'slate-react'
import { List, ListItem, Popover } from '~chord'
import {
  textTypeMenu,
  tablatureTypeMenu,
  chordTypeMenu,
  flatTypeArr,
  type ToolType,
} from './tools.config'
import { isBlockActive } from '~common'

export const SlashToolbar: FC<HTMLProps<HTMLDivElement>> = (props) => {
  const editor = useSlate()
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [target, setTarget] = useState<Range | null>()
  const [search, setSearch] = useState('')

  const filterList = useMemo(() => {
    if (!search || search.length < 2) {
      return []
    }

    const text = search.slice(1) // 截取掉前面‘/’
    return flatTypeArr.filter(
      (item) =>
        item.title.toLocaleLowerCase().includes(text.toLocaleLowerCase()) ||
        item.desc.toLocaleLowerCase().includes(text.toLocaleLowerCase())
    )
  }, [search])

  const nestedList = useMemo(() => {
    if (filterList.length) {
      return []
    }
    if (search && search.length > 1) {
      return []
    }
    return [
      {
        title: 'Basic blocks',
        list: textTypeMenu.slice(0, 8),
      },
      {
        title: 'Tablature blocks',
        list: tablatureTypeMenu,
      },
      {
        title: 'Chord cards',
        list: chordTypeMenu,
      },
    ]
  }, [filterList.length, search])

  useEffect(() => {
    if (target) {
      const domRange = ReactEditor.toDOMRange(editor, target)
      const rect = domRange.getBoundingClientRect()
      setRect(rect)
    }
  }, [editor, target])

  const onChange = useCallback(() => {
    const { selection } = editor
    if (!selection || !Range.isCollapsed(selection) || isBlockActive(editor, 'abc-tablature')) {
      setTarget(null)
      return
    }

    const [start] = Range.edges(selection)
    const lineBefore = Editor.before(editor, start, { unit: 'line' })
    const beforeLine = Editor.string(editor, Editor.range(editor, start, lineBefore))

    if (beforeLine.lastIndexOf('/') === -1) {
      setTarget(null)
      return
    }
    // 前面取到「/」
    const beforeDistance = beforeLine.length - beforeLine.lastIndexOf('/')
    const before = beforeDistance && Editor.before(editor, start, { distance: beforeDistance })
    const beforeRange = before && Editor.range(editor, start, before)
    const beforeText = beforeRange && Editor.string(editor, beforeRange)

    // 后面取到空格「 」
    const after = Editor.after(editor, start)
    const afterRange = Editor.range(editor, start, after)
    const afterText = Editor.string(editor, afterRange)
    const afterMatch = afterText.match(/^(\s|$)/)

    if (beforeText && afterMatch) {
      setTarget(beforeRange)
      setSearch(beforeText)
      return
    }

    setTarget(null)
  }, [editor])

  useEffect(() => {
    const originalOnChange = editor.onChange
    editor.onChange = (options?: { operation?: BaseOperation }) => {
      originalOnChange(options)
      onChange()
    }
  }, [editor, onChange])

  const renderItem = useCallback((item: ToolType) => {
    return <ListItem item={item} />
  }, [])

  const cleanSearch = useCallback(() => {
    setTarget(null)
    setSearch('')
    setRect(null)
  }, [])

  const onItemClick = useCallback(
    (item: ToolType) => {
      if (target) {
        // 清除slash前缀
        Transforms.select(editor, target)
        editor.delete()
      }
      switch (item.type) {
        case 'text':
        case 'tablature':
          editor.insertBlock?.({ type: item.key as BlockFormat })
          break

        case 'chord':
          //插入inline-chord前缀标记
          editor.insertText(item.key)
          break

        default:
          break
      }

      cleanSearch()
    },
    [cleanSearch, editor, target]
  )

  if (!filterList.length && !nestedList.length) {
    return null
  }

  if (!target || !search || !rect) {
    return null
  }

  return (
    <Popover
      data-cy="input-toolbar-portal"
      style={{ maxHeight: '360px' }}
      rect={rect}
      onClose={cleanSearch}
    >
      <List
        nestedLists={nestedList}
        lists={filterList}
        renderItem={renderItem}
        onItemClick={onItemClick}
      >
        {props.children}
      </List>
    </Popover>
  )
}
