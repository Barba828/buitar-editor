import { memo, useEffect, FC, useCallback, useState, ChangeEventHandler } from 'react'
import { useSlate } from 'slate-react'
import { BoardChord } from '@buitar/to-guitar'
import { getSelectedLeavesFormat, getSelectedRect, type CommonPopoverProps, Popover,  } from '~common'
import { SearchList } from '~chord'
import { getChordName } from '~chord/utils'

import './input-chord-popover.scss'

export const InputChordPopover: FC<CommonPopoverProps> = memo(
  ({ visible = true, onVisibleChange }) => {
    const [search, setSearch] = useState('')
    const [text, setText] = useState('')
    const [rect, setRect] = useState<DOMRect | null>(null)
    const editor = useSlate()
    const { selection } = editor

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
      </Popover>
    )
  }
)
