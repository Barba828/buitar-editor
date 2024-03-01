import { useState, useRef, useMemo, useEffect, Ref, useCallback } from 'react'
import { Range, Editor, Transforms, CustomTypes, BaseOperation } from 'slate'
import { ReactEditor } from 'slate-react'
import { chordTagMap, type BoardChord, pitchToChordType } from '@buitar/to-guitar'
import { getNoteAndTag, getTapsByChordName, strsToTaps } from './utils'
import { PopoverList, popoverListShow } from './components/popover-list'
import { PopoverTapsItem } from './components/taps-item'
import { CustomInlineChordElement } from './custom-types'

const tags = Array.from(chordTagMap.keys())

type ChordInputTag = '' | '/c' | '/C' | '/x' | '/X'

export const useInlineChord = (editor: CustomTypes['Editor']) => {
  const customRef = useRef<HTMLDivElement | null>()
  const tagRef = useRef<HTMLDivElement | null>()
  const tapsRef = useRef<HTMLDivElement | null>()
  const [inputTag, setInputTag] = useState<ChordInputTag | null>()
  const [target, setTarget] = useState<Range | null>()
  const [search, setSearch] = useState('')
  const [selectedChord, setSelectedChord] = useState('')

  /**Chord Tag 列表 */
  const chordList = useMemo(() => {
    if (inputTag !== '/C' && inputTag !== '/c') {
      return []
    }
    if (!search.length) {
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
  }, [search, target])

  /**选中Tag后 Chord Taps 列表 */
  const chordTapList = useMemo<BoardChord[]>(() => {
    if (!selectedChord.length) {
      return []
    }
    return getTapsByChordName(selectedChord)
  }, [selectedChord])

  /**自定义 Chord Taps 列表 */
  const customChordTapList = useMemo<BoardChord[]>(() => {
    if (inputTag !== '/X' && inputTag !== '/x') {
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

  useEffect(() => {
    if (inputTag === '/C' || inputTag === '/c') {
      // 1. 自选和弦
      if (search !== selectedChord && selectedChord.length) {
        setSelectedChord('')
      }

      if (target && tagRef.current) {
        const el = tagRef.current
        const domRange = ReactEditor.toDOMRange(editor, target)
        const rect = domRange.getBoundingClientRect()
        popoverListShow(el, rect)
      }
    } else if (inputTag === '/X' || inputTag === '/x') {
      // 2. 自定义和弦
      if (target && customRef.current) {
        const el = customRef.current
        const domRange = ReactEditor.toDOMRange(editor, target)
        const rect = domRange.getBoundingClientRect()
        popoverListShow(el, rect)
      }
    }
  }, [editor, search, selectedChord, target])

  useEffect(() => {
    if (chordTapList.length && tapsRef.current && target) {
      const el = tapsRef.current
      const domRange = ReactEditor.toDOMRange(editor, target)
      const rect = domRange.getBoundingClientRect()
      popoverListShow(el, rect)
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
      editor.insertInlineChord?.(taps, inputTag === '/c' || inputTag === '/x')
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

    let slashTag = ''
    if (beforeLine.includes('/c')) {
      slashTag = '/c'
    } else if (beforeLine.includes('/C')) {
      slashTag = '/C'
    } else if (beforeLine.includes('/x')) {
      slashTag = '/x'
    } else if (beforeLine.includes('/X')) {
      slashTag = '/X'
    } else {
      setTarget(null)
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
  }, [editor])

  const ChordPopover = () => {
    if (!target || !search) {
      return null
    }

    if (inputTag === '/c' || inputTag === '/C') {
      if (chordTapList.length) {
        return (
          <PopoverList
            ref={tapsRef as Ref<HTMLDivElement>}
            data-cy="taps-portal"
            lists={chordTapList}
            renderItem={(taps) => <PopoverTapsItem taps={taps} />}
            onItemClick={onSelectTaps}
            style={{ maxHeight: '360px' }}
          ></PopoverList>
        )
      } else if (chordList.length) {
        return (
          <PopoverList
            ref={tagRef as Ref<HTMLDivElement>}
            data-cy="tags-portal"
            lists={chordList}
            onItemClick={onSelectChord}
          ></PopoverList>
        )
      }
    } else if (inputTag === '/X' || inputTag === '/x') {
      return (
        customChordTapList.length && (
          <PopoverList
            ref={customRef as Ref<HTMLDivElement>}
            data-cy="frets-portal"
            lists={customChordTapList}
            renderItem={(taps) => <PopoverTapsItem taps={taps} size={140} />}
            onItemClick={onSelectTaps}
            style={{ maxHeight: '360px' }}
          ></PopoverList>
        )
      )
    }

    return null
  }

  return {
    onChange,
    ChordPopover,
  }
}

export const withChords = (editor: CustomTypes['Editor']) => {
  const { isInline, isVoid, markableVoid } = editor

  editor.isInline = (element: CustomTypes['Element']) => {
    return element.type === 'inline-chord' ? true : isInline(element)
  }

  editor.isVoid = (element: CustomTypes['Element']) => {
    return element.type === 'inline-chord' ? true : isVoid(element)
  }

  editor.markableVoid = (element: CustomTypes['Element']) => {
    return element.type === 'inline-chord' || markableVoid(element)
  }

  editor.insertInlineChord = (taps: BoardChord, concise?: boolean) => {
    const chord: CustomInlineChordElement = {
      type: 'inline-chord',
      taps,
      concise: !!concise,
      children: [{ text: '' }],
    }
    Transforms.insertNodes(editor, chord)
    Transforms.move(editor)
  }

  return editor
}
