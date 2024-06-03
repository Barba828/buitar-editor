import type { Descendant } from 'slate'
import type { BoardChord } from '@buitar/to-guitar'
import type { TablatureInstrument } from 'abcjs'

export type CustomChordType = {
  taps: BoardChord
  concise?: boolean
  popover?: boolean
  size?: number
}

export type CustomInlineChordElement = {
  type: 'inline-chord'
  children?: Descendant[]
} & CustomChordType

export type CustomBlockTablatureElement = {
  type: 'block-tablature'
  title?: string
  stringNums?: number
  size?: number
  horizontal?: boolean
  range?: [number, number]
  data?: string
  children?: Descendant[]
}

export type ABCTablatureElement = {
  type: 'abc-tablature'
  instrument?: TablatureInstrument
  data?: string
  children?: Descendant[]
}

export type GTPPreviewerElement = {
  type: 'gtp-previewer'
  link: string
  extend?: boolean
  children?: Descendant[]
}

export type CustomChordText = {
  text: string
  chord?: CustomChordType
}

export type ChordEditor = {
  insertInlineChord?: (taps: BoardChord, concise?: boolean) => void
  insertFixedChord?: (text: string, chord: CustomChordType) => void
}
