import { useState, useMemo, useEffect, useCallback, FC, HTMLProps } from 'react'
import { Range, Editor, BaseOperation, Transforms } from 'slate'
import { ReactEditor, useSlate } from 'slate-react'
import { isBlockActive, List, ListItem, Popover } from '~common'
import {
  textTypeMenu,
  tablatureTypeMenu,
  chordTypeMenu,
  flatTypeArr,
  type ToolType,
  embedTypeMenu,
} from '~/editor/tools.config'

import { NONE_RICH_WRAP_TYPES } from '~/editor/plugins/config'

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
        list: textTypeMenu.slice(0, 10),
      },
      {
        title: 'Embed blocks',
        list: embedTypeMenu,
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
    if (!selection || !Range.isCollapsed(selection)) {
      setTarget(null)
      return
    }

    if (isBlockActive(editor, NONE_RICH_WRAP_TYPES)) {
      setTarget(null)
      return
    }

    const [start] = Range.edges(selection)
    const lineBefore = Editor.before(editor, start, { unit: 'line' })
    const beforeLine = Editor.string(editor, Editor.range(editor, start, lineBefore))

    // console.log('debug beforeLine', start, lineBefore, beforeLine)
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
      switch (item.tag) {
        case 'text':
        case 'embed':
        case 'tablature':
          const newProperties = { type: item.key as BlockFormat }
          editor.insertBlock?.(newProperties)
          break

        case 'chord':
          //插入inline-chord前缀标记
          editor.insertText(item.key)
          break

        default:
          break
      }
      ReactEditor.focus(editor)
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
      rect={rect}
      onClose={cleanSearch}
      className='w-64 max-h-96'
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
