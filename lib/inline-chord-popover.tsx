import { useState, useMemo, useEffect, useCallback, FC, memo } from 'react'
import { Range, Editor, Transforms, BaseOperation } from 'slate'
import { ReactEditor, useSlate } from 'slate-react'
import { type BoardChord } from '@buitar/to-guitar'
import { getChordName } from './utils'
import { Popover, type CommonPopoverProps } from './components/popover'
import { inputTags, ChordInputTag } from './config'
import { SearchList } from './search-list'

export const InlineChordPopover: FC<CommonPopoverProps> = memo((props) => {
  const editor = useSlate()
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [inputTag, setInputTag] = useState<ChordInputTag | null>()
  const [target, setTarget] = useState<Range | null>()
  const [search, setSearch] = useState('')

  useEffect(() => {
    onChange()
  }, [])

  const isConcise = useMemo(() => {
    return inputTag === inputTag?.toLowerCase()
  }, [inputTag])
  const isCustom = useMemo(() => {
    return inputTag === '-X' || inputTag === '-x' || inputTag === '-R' || inputTag === '-r'
  }, [inputTag])
  const isFixed = useMemo(() => {
    return inputTag === '-T' || inputTag === '-t' || inputTag === '-R' || inputTag === '-r'
  }, [inputTag])

  const onSelectChord = (chordName: string) => {
    if (!target) {
      return
    }
    // 插入和弦文本
    Transforms.select(editor, target)
    editor.insertText(inputTag + chordName)
  }

  const onSelectTaps = (taps: BoardChord) => {
    if (target) {
      Transforms.select(editor, target)
      if (isFixed) {
        const title = getChordName(taps.chordType)
        editor.insertFixedChord?.(title, {
          taps,
          concise: isConcise,
        })
      } else {
        editor.insertInlineChord?.(taps, isConcise)
      }
      setTarget(null)
    }
  }

  /**根据 input tag 显示对应 taps */
  useEffect(() => {
    if (target) {
      const domRange = ReactEditor.toDOMRange(editor, target)
      const rect = domRange.getBoundingClientRect()
      setRect(rect)
    } else {
      setRect(null)
    }
  }, [editor, target])

  const onChange = useCallback(() => {
    const { selection } = editor
    if (!(selection && Range.isCollapsed(selection))) {
      return
    }
    const [start] = Range.edges(selection)
    // 获取整个line的range，再获取[/c ~ 空格]段作为search的文本
    const lineBefore = Editor.before(editor, start, { unit: 'line' })
    const beforeLine = Editor.string(editor, Editor.range(editor, start, lineBefore))

    // 当前range下的slashTag「/c...」
    const slashTag = inputTags.find((tag) => beforeLine.includes(tag))
    if (!slashTag) {
      setTarget(null)
      setSearch('')
      setInputTag('')
      return
    }
    // 前面取到「/c」
    const beforeDistance = beforeLine.length - beforeLine.lastIndexOf(slashTag)
    const before = beforeDistance && Editor.before(editor, start, { distance: beforeDistance })
    const beforeRange = before && Editor.range(editor, start, before)
    const beforeText = beforeRange && Editor.string(editor, beforeRange).slice(2)

    // 后面取到空格「 」
    const after = Editor.after(editor, start)
    const afterRange = Editor.range(editor, start, after)
    const afterText = Editor.string(editor, afterRange)
    const afterMatch = afterText.match(/^(\s|$)/)

    if (beforeText && afterMatch) {
      setTarget(beforeRange)
      setSearch(beforeText)
      setInputTag(slashTag as ChordInputTag)
    } else {
      setTarget(null)
    }
  }, [editor])

  useEffect(() => {
    const originalOnChange = editor.onChange
    editor.onChange = (options?: { operation?: BaseOperation }) => {
      originalOnChange(options)
      onChange()
    }
  }, [editor, onChange])

  /**输入检测 input tag 并设置 target 和 search*/
  if (!target || !search || !inputTag || !rect) {
    return null
  }

  return (
    <Popover
      rect={rect}
      data-cy="inline-chord-portal"
      style={{ maxHeight: '360px' }}
      onClose={() => setTarget(null)}
      {...props}
    >
      <SearchList
        search={search}
        onSelectTaps={onSelectTaps}
        onSelectChord={onSelectChord}
        isCustom={isCustom}
      />
    </Popover>
  )
})
