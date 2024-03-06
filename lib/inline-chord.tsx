import { useState, useRef, useMemo, useEffect, useCallback, FC } from 'react'
import { Range, Editor, Transforms, BaseOperation } from 'slate'
import { ReactEditor, useSlate } from 'slate-react'
import { chordTagMap, type BoardChord, pitchToChordType } from '@buitar/to-guitar'
import { getChordName, getNoteAndTag, getTapsByChordName, strsToTaps } from './utils'
import { Popover, type PopoverRefs } from './components/popover'
import { TapsListItem } from './components/taps-item'
import { List } from './components/list'

/**
 * c - chord 自选inline和弦
 * x - custom 自定义inline和弦
 * t - tap 自选fixed和弦
 * r - rest 自定义fixed和弦
 * Uppercase - 详情和弦卡片
 */
type ChordInputTag = '' | '/c' | '/C' | '/x' | '/X' | '/t' | '/T' | '/r' | '/R'

const tags = Array.from(chordTagMap.keys())
const inputTags: ChordInputTag[] = ['/c', '/C', '/x', '/X', '/t', '/T', '/r', '/R']

export const InlineChordPopover: FC = () => {
  const editor = useSlate()
  const customRef = useRef<PopoverRefs>(null)
  const tagRef = useRef<PopoverRefs>(null)
  const tapsRef = useRef<PopoverRefs>(null)
  const [inputTag, setInputTag] = useState<ChordInputTag | null>()
  const [target, setTarget] = useState<Range | null>()
  const [search, setSearch] = useState('')
  const [selectedChord, setSelectedChord] = useState('')

  const isConcise = useMemo(() => {
    return inputTag === inputTag?.toLowerCase()
  }, [inputTag])
  const isCustom = useMemo(() => {
    return inputTag === '/X' || inputTag === '/x' || inputTag === '/R' || inputTag === '/r'
  }, [inputTag])
  const isFixed = useMemo(() => {
    return inputTag === '/T' || inputTag === '/t' || inputTag === '/R' || inputTag === '/r'
  }, [inputTag])

  /**根据 search => Chord Tag 列表 */
  const chordList = useMemo(() => {
    if (!inputTag || !search || isCustom) {
      return []
    }
    if (!['C', 'D', 'E', 'F', 'G', 'A', 'B'].includes(search[0].toLocaleUpperCase())) {
      return []
    }

    const { note, tag } = getNoteAndTag(search)
    if (search.length === 1) {
      return ['', 'b', '#', ...tags.slice(1)].map((t) => note + t)
    }
    return tags.filter((t) => t.includes(tag)).map((t) => note + t)
  }, [search, target, inputTag])

  /**根据 selectedChord => Chord Taps 列表 */
  const chordTapList = useMemo<BoardChord[]>(() => {
    if (!selectedChord.length) {
      return []
    }
    return getTapsByChordName(selectedChord)
  }, [selectedChord])

  /**自定义 Chord Taps 列表 */
  const customChordTapList = useMemo<BoardChord[]>(() => {
    if (!isCustom) {
      return []
    }
    if (!search.length || search.length > 6) {
      return []
    }

    const frets = search.slice(0, 6).split('')
    while (frets.length < 6) {
      frets.push('x')
    }

    const chordTaps = strsToTaps(frets)
    const chordTypes = pitchToChordType(Array.from(new Set(chordTaps.map((tap) => tap.tone))))

    // 无效和弦
    if (!chordTypes.length) {
      return [
        {
          chordTaps,
          chordType: {
            name: '--',
            name_zh: '--',
            tag: '',
          },
        },
      ]
    }

    // 同一taps 也许有转位和弦等多个名称
    return chordTypes.map(
      (chordType) =>
        ({
          chordTaps,
          chordType,
        } as BoardChord)
    )
  }, [search, target])

  /**输入检测 input tag 显示Popover菜单*/
  useEffect(() => {
    if (!inputTag) {
      return
    }
    if (!isCustom) {
      // 1. 自选和弦
      if (search !== selectedChord && selectedChord.length) {
        // search变动时，隐藏后续taps，继续根据search选择tag
        setSelectedChord('')
      }
      if (target && tagRef.current) {
        const domRange = ReactEditor.toDOMRange(editor, target)
        const rect = domRange.getBoundingClientRect()
        tagRef.current.show(rect)
      }
    } else {
      // 2. 自定义和弦
      if (target && customRef.current) {
        const domRange = ReactEditor.toDOMRange(editor, target)
        const rect = domRange.getBoundingClientRect()
        customRef.current.show(rect)
      }
    }
  }, [editor, search, selectedChord, target])

  /**根据 input tag 显示对应 taps */
  useEffect(() => {
    if (chordTapList.length && tapsRef.current && target) {
      const domRange = ReactEditor.toDOMRange(editor, target)
      const rect = domRange.getBoundingClientRect()
      tapsRef.current.show(rect)
    }
  }, [chordTapList])

  const onSelectChord = (chordName: string) => {
    if (!target) {
      return
    }
    // 插入和弦文本
    Transforms.select(editor, target)
    editor.insertText(inputTag + chordName)

    // 选择b/#升降号则返回继续选择tag，否则设置当前和弦有效名称
    if (
      chordName.length === 2 &&
      (chordName.endsWith('b') || chordName.endsWith('#')) &&
      chordName !== search
    ) {
      return
    }
    setSelectedChord(chordName)
  }

  const onSelectTaps = (taps: BoardChord) => {
    if (target) {
      Transforms.select(editor, target)
      if (isFixed) {
        const title = getChordName(taps.chordType)
        editor.insertFixedChord?.(title, taps, isConcise)
      } else {
        editor.insertInlineChord?.(taps, isConcise)
      }

      setTarget(null)
      setSelectedChord('')
    }
  }

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
      return
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

  if (!isCustom) {
    if (chordTapList.length) {
      return (
        <Popover ref={tapsRef} data-cy="taps-portal" style={{ maxHeight: '360px' }}>
          <List
            lists={chordTapList}
            renderItem={(taps) => <TapsListItem taps={taps} />}
            onItemClick={onSelectTaps}
          ></List>
        </Popover>
      )
    } else if (chordList.length) {
      return (
        <Popover ref={tagRef} data-cy="tags-portal">
          <List lists={chordList} onItemClick={onSelectChord}></List>
        </Popover>
      )
    }
  } else {
    return (
      customChordTapList.length && (
        <Popover ref={customRef} data-cy="frets-portal" style={{ maxHeight: '360px' }}>
          <List
            lists={customChordTapList}
            renderItem={(taps) => <TapsListItem taps={taps} size={140} />}
            onItemClick={onSelectTaps}
          ></List>
        </Popover>
      )
    )
  }
}
