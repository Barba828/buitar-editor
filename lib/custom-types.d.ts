import type { BoardChord } from '@buitar/to-guitar'

type CustomChordType = {
  taps: BoardChord
  concise?: boolean
  popover?: boolean
}

export type CustomInlineChordElement = {
  type: 'inline-chord'
  children?: CustomText[]
} & CustomChordType

export type CustomChordText = {
  text: string
  chord?: CustomChordType
}

export type ChordEditor = {
  insertInlineChord?: (taps: BoardChord, concise?: boolean) => void
  insertFixedChord?: (text: string, chord: CustomText['chord']) => void
}
