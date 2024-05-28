import { memo, useEffect, FC, useCallback, useState, ChangeEventHandler, useMemo } from 'react'
import { useSlate } from 'slate-react'
import { Editor, Transforms } from 'slate'
import { BoardChord } from '@buitar/to-guitar'
import {
  getSelectedLeavesFormat,
  getSelectedRect,
  type CommonPopoverProps,
  Popover,
  ListItem,
  Icon,
  isMarkActive,
} from '~common'
import { CustomChordText, CustomChordType, SearchList } from '~chord'
import { getChordName } from '~chord/utils'
import cx from 'classnames'

import './input-chord-popover.scss'

export const InputChordPopover: FC<CommonPopoverProps> = memo(
  ({ visible = true, onVisibleChange }) => {
    const [search, setSearch] = useState('')
    const [text, setText] = useState('')
    const [rect, setRect] = useState<DOMRect | null>(null)
    const [leaf, setLeaf] = useState<CustomChordText>()
    const editor = useSlate()
    const { selection } = editor
    const chordMarks = Editor.marks(editor)?.chord

    useEffect(() => {
      const selectedRect = getSelectedRect(editor)
      // 未选中内容 -> 不能添加chord
      if (!selectedRect || !selection || !visible) {
        return
      }

      // 选中文本内容中，已有chord内容 -> 写入第一个chord名称
      const chordLeaves = getSelectedLeavesFormat(editor, 'chord')
      if (chordLeaves.length && chordLeaves[0].chord?.taps?.chordType) {
        setSearch(getChordName(chordLeaves[0].chord.taps.chordType))
        setLeaf(chordLeaves[0])
      }

      setText(editor.string(selection))
      setRect(selectedRect)
    }, [editor, selection, visible])

    const onInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
      setSearch(e.target.value)
    }, [])
    const onInputTextChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
      setText(e.target.value)
    }, [])

    const onSelectTaps = (taps: BoardChord) => {
      editor.insertFixedChord?.(text, { taps })
    }
    const removeChord = useCallback(() => {
      if (isMarkActive(editor, 'chord')) {
        editor.removeMark('chord')
        Transforms.move(editor)
        return
      }
    }, [editor])
    const changeChord = (option: keyof CustomChordType) => {
      const active = chordMarks?.[option]
      console.log('lnz chordMarks', chordMarks);
      Editor.addMark(editor, 'chord', { ...chordMarks, [option]: !active })
    }

    if (!visible || !rect) {
      return null
    }

    return (
      <Popover
        className="input-container"
        data-cy="input-chord-portal"
        onVisibleChange={onVisibleChange}
        rect={rect}
      >
        <input placeholder="Text" onChange={onInputTextChange} value={text}></input>
        <input placeholder="Chord Name" onChange={onInputChange} value={search} autoFocus></input>
        <SearchList search={search} onSelectChord={setSearch} onSelectTaps={onSelectTaps} />
        {leaf?.chord && (
          <>
            <ListItem
              onClick={() => changeChord('concise')}
              className={cx("h-8 rounded mt-1 text-gray-600 dark:text-gray-300 hover:bg-blue-500 hover:text-white transition-all duration-300", { 'text-blue-600': !chordMarks?.concise })}
              item={{ title: 'Show String Tone' }}
              left={<Icon name={'icon-title'} className="m-1 mr-2" />}
            ></ListItem>
            <ListItem
              onClick={() => changeChord('popover')}
              className={cx("h-8 rounded mt-1 text-gray-600 dark:text-gray-300 hover:bg-blue-500 hover:text-white transition-all duration-300", { 'text-blue-600': chordMarks?.popover })}
              item={{ title: 'Show Popover' }}
              left={<Icon name={'icon-popover'} className="m-1 mr-2" />}
            ></ListItem>
            <ListItem
              onClick={removeChord}
              className="h-8 rounded mt-1 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white transition-all duration-300"
              item={{ title: 'Reomve Chord' }}
              left={<Icon name={'icon-remove'} className="m-1 mr-2" />}
            ></ListItem>
          </>
        )}
      </Popover>
    )
  }
)
