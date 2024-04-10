import { useState, useMemo, useEffect, useCallback, FC, HTMLProps } from 'react'
import { Range, Editor, BaseOperation, Transforms } from 'slate'
import { ReactEditor, useSlate } from 'slate-react'
import { List, ListItem, Popover, useInlineChordPopover } from '~chord'
import { slashChordMenu } from '~chord/config'

export const SlashToolbar: FC<HTMLProps<HTMLDivElement>> = (props) => {
  const editor = useSlate()
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [target, setTarget] = useState<Range | null>()
  const [search, setSearch] = useState('')

  const inlineChordPopover = useInlineChordPopover(search)

  const filterList = useMemo(() => {
    if (!search) {
      return []
    }

    if (search.length === 1) {
      return slashChordMenu
    }

    const text = search.slice(1)
    return slashChordMenu.filter((item) => item.title.includes(text) || item.desc.includes(text))
  }, [search])

  useEffect(() => {
    if (target) {
      const domRange = ReactEditor.toDOMRange(editor, target)
      const rect = domRange.getBoundingClientRect()
      setRect(rect)
    }
  }, [editor, target])

  const onChange = useCallback(() => {
    const { selection } = editor
    if (!(selection && Range.isCollapsed(selection))) {
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

  const renderItem = useCallback((item: (typeof slashChordMenu)[0]) => {
    return <ListItem item={item} />
  }, [])

  const cleanSearch = useCallback(() => {
    setTarget(null)
    setSearch('')
    setRect(null)
  }, [])

  const onItemClick = useCallback(
    (item: (typeof slashChordMenu)[0]) => {
      if (item.type === 'chord' && target) {
        Transforms.select(editor, target)
        editor.insertText(item.key)
      }
      cleanSearch()
    },
    [cleanSearch, editor, target]
  )

  if (inlineChordPopover) {
    return inlineChordPopover
  }

  /**输入检测 input tag 并设置 target 和 search*/
  if (!target || !search || !rect) {
    return null
  }

  if (!filterList.length) {
    return null
  }

  return (
    <Popover
      data-cy="input-toolbar-portal"
      style={{ maxHeight: '360px' }}
      rect={rect}
      onClose={cleanSearch}
    >
      <List lists={filterList} renderItem={renderItem} onItemClick={onItemClick}>
        {props.children}
      </List>
    </Popover>
  )
}
