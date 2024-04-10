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

export type ABCTablatureElement = {
  type: 'abc-tablature'
  previewer?: boolean
  children?: CustomText[]
}

export type GTPPreviewerElement = {
  type: 'gtp-previewer'
  children?: CustomText[]
}

export type CustomChordText = {
  text: string
  chord?: CustomChordType
}

export type ChordEditor = {
  insertInlineChord?: (taps: BoardChord, concise?: boolean) => void
  insertFixedChord?: (text: string, chord: CustomText['chord']) => void
}
