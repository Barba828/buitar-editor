import { useState, useRef, useMemo, useEffect, useCallback, FC } from 'react'
import { Range, Editor, Transforms, BaseOperation } from 'slate'
import { ReactEditor, useSlate } from 'slate-react'
import { type BoardChord } from '@buitar/to-guitar'
import { getChordName } from './utils'
import { Popover, type PopoverRefs } from './components/popover'
import { useSearchList } from './utils/use-search-list'

/**
 * c - chord 自选inline和弦
 * x - custom 自定义inline和弦
 * t - tap 自选fixed和弦
 * r - rest 自定义fixed和弦
 * Uppercase - 详情和弦卡片
 */
type ChordInputTag = '' | '/c' | '/C' | '/x' | '/X' | '/t' | '/T' | '/r' | '/R'
const inputTags: ChordInputTag[] = ['/c', '/C', '/x', '/X', '/t', '/T', '/r', '/R']

export const InlineChordPopover: FC = () => {
  const editor = useSlate()
  const ref = useRef<PopoverRefs>(null)
  const [inputTag, setInputTag] = useState<ChordInputTag | null>()
  const [target, setTarget] = useState<Range | null>()
  const [search, setSearch] = useState('')

  const isConcise = useMemo(() => {
    return inputTag === inputTag?.toLowerCase()
  }, [inputTag])
  const isCustom = useMemo(() => {
    return inputTag === '/X' || inputTag === '/x' || inputTag === '/R' || inputTag === '/r'
  }, [inputTag])
  const isFixed = useMemo(() => {
    return inputTag === '/T' || inputTag === '/t' || inputTag === '/R' || inputTag === '/r'
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

  const { list } = useSearchList({
    search,
    isCustom,
    onSelectTaps,
    onSelectChord,
  })

  /**根据 input tag 显示对应 taps */
  useEffect(() => {
    if (list && ref.current && target) {
      const domRange = ReactEditor.toDOMRange(editor, target)
      const rect = domRange.getBoundingClientRect()
      ref.current.show(rect)
    }
  }, [editor, list, target])

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
  if (!target || !search || !inputTag) {
    return null
  }

  return (
    <Popover ref={ref} data-cy="inline-chord-portal" style={{ maxHeight: '360px' }}>
      {list}
    </Popover>
  )
}
