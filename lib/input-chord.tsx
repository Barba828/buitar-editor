import { useRef, useEffect, FC, useCallback, useState, ChangeEventHandler } from 'react'
import { useSlate } from 'slate-react'
import { Popover, type PopoverRefs } from './components/popover'
import { BoardChord } from '@buitar/to-guitar'
import { useSearchList } from './utils/use-search-list'

import './input-chord.scss'

interface InputChordPopoverProps {
  visible?: boolean
}
export const InputChordPopover: FC<InputChordPopoverProps> = ({ visible }) => {
  const ref = useRef<PopoverRefs>(null)
  const [search, setSearch] = useState('')
  const [text, setText] = useState('')
  const editor = useSlate()
  const onSelectTaps = (taps: BoardChord) => {
    editor.insertFixedChord?.(text, { taps })
  }

  const { list } = useSearchList({
    search,
    onSelectChord(chordName) {
      setSearch(chordName)
    },
    onSelectTaps: onSelectTaps,
  })

  useEffect(() => {
    if (!ref.current) {
      return
    }
    const domSelection = window.getSelection()

    if (!domSelection || !visible) {
      ref.current.hide()
      return
    }
    setText(domSelection.toString())
    const domRange = domSelection.getRangeAt(0)
    const rect = domRange.getBoundingClientRect()
    ref.current.show(rect)
  }, [visible])

  const onInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setSearch(e.target.value)
  }, [])
  const onInputTextChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setText(e.target.value)
  }, [])

  return (
    <Popover ref={ref} className="input-container" data-cy="input-chord-portal">
      <input placeholder="Text" onChange={onInputTextChange} value={text}></input>
      <input placeholder="Chord Name" onChange={onInputChange} value={search}></input>
      {list}
    </Popover>
  )
}
