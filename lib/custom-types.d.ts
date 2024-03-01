import { BaseEditor, Descendant } from 'slate'
import { ReactEditor } from 'slate-react'
import { HistoryEditor } from 'slate-history'
import { BoardChord } from '@buitar/to-guitar'
type CustomElement = { type: 'paragraph'; children: Descendant[] }
type CustomInlineChordElement = {
  type: 'inline-chord'
  taps: BoardChord
  concise?: boolean
  children?: CustomText[]
}
type CustomText = {
  bold?: boolean
  italic?: boolean
  code?: boolean
  text: string
}

type CustomEditor = {
  insertInlineChord?: (taps: BoardChord, concise?: boolean) => void
} & BaseEditor &
  ReactEditor &
  HistoryEditor

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement | CustomInlineChordElement
    Text: CustomText
  }
}
