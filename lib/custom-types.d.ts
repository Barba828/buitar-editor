import type { BaseEditor, Descendant } from 'slate'
import type { ReactEditor } from 'slate-react'
import type { HistoryEditor } from 'slate-history'
import type { BoardChord } from '@buitar/to-guitar'

type CustomChordType = {
  taps: BoardChord
  concise?: boolean
  popover?: boolean
}

type CustomElement = { type: 'paragraph'; children: Descendant[] }
type CustomInlineChordElement = {
  type: 'inline-chord'
  children?: CustomText[]
} & CustomChordType
type CustomText = {
  bold?: boolean
  italic?: boolean
  code?: boolean
  underlined?: boolean
  strike?: boolean
  text: string
  chord?: CustomChordType
}

type CustomEditor = {
  insertInlineChord?: (taps: BoardChord, concise?: boolean) => void
  insertFixedChord?: (text: string, chord: CustomText['chord']) => void
}

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor & BaseEditor & ReactEditor & HistoryEditor
    Element: CustomElement | CustomInlineChordElement
    Text: CustomText
  }
}
