import { useState, useRef, useMemo, useEffect, useCallback, FC, HTMLProps } from 'react'
import { Range, Editor, BaseOperation, Transforms } from 'slate'
import { ReactEditor, useSlate } from 'slate-react'
import { InlineChordPopover, List, Popover, PopoverRefs } from './index'
import { inputTags } from './config'

import './slash-toolbar.scss'

const defaultSlashMenu = [
  {
    type: 'chord',
    key: '/CAm7',
    title: 'Inline Chord',
    desc: 'Insert Inline Chord',
  },
  {
    type: 'chord',
    key: '/Xx02010',
    title: 'Inline Custom Chord',
    desc: 'Insert Inline Custom Chord',
  },
  {
    type: 'chord',
    key: '/TAm7',
    title: 'Fixed Chord',
    desc: 'Insert Fixed Chord',
  },
  {
    type: 'chord',
    key: '/Rx02010',
    title: 'Fixed Custom Chord',
    desc: 'Insert Fixed Custom Chord',
  },
]

export const SlashToolbar: FC<HTMLProps<HTMLDivElement>> = (props) => {
  const editor = useSlate()
  const ref = useRef<PopoverRefs>(null)
  const [target, setTarget] = useState<Range | null>()
  const [search, setSearch] = useState('')

  /**显示inlineChord Popover（隐藏menu Popover） */
  const isShowInlineChord = useMemo(() => {
    return inputTags.find((tag) => search.startsWith(tag)) && search.length > 2
  }, [search])

  const filterList = useMemo(() => {
    if (!search) {
      return []
    }

    if (search.length === 1) {
      return defaultSlashMenu
    }

    const text = search.slice(1)
    return defaultSlashMenu.filter((item) => item.title.includes(text) || item.desc.includes(text))
  }, [search])

  useEffect(() => {
    if (ref.current && target) {
      const domRange = ReactEditor.toDOMRange(editor, target)
      const rect = domRange.getBoundingClientRect()
      ref.current.show(rect)
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

  const renderItem = (item: (typeof defaultSlashMenu)[0], index: number) => {
    return (
      <div key={index} className="toolbar-chord-item">
        <div className="toolbar-chord-item--title">{item.title}</div>
        <div className="toolbar-chord-item--desc">{item.desc}</div>
      </div>
    )
  }

  const onItemClick = useCallback(
    (item: (typeof defaultSlashMenu)[0]) => {
      if (item.type === 'chord' && target) {
        Transforms.select(editor, target)
        editor.insertText(item.key)
      }

      setTarget(null)
      setSearch('')
    },
    [editor, target]
  )

  /**输入检测 input tag 并设置 target 和 search*/
  if (!target || !search) {
    return null
  }

  if (isShowInlineChord) {
    return <InlineChordPopover />
  }

  return (
    <Popover ref={ref} data-cy="input-toolbar-portal" style={{ maxHeight: '360px' }}>
      <List lists={filterList} renderItem={renderItem} onItemClick={onItemClick}>
        {props.children}
      </List>
    </Popover>
  )
}
