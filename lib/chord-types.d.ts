import type { BoardChord } from '@buitar/to-guitar'
import { CustomTypes } from 'slate'

type CustomChordType = {
  taps: BoardChord
  concise?: boolean
  popover?: boolean
}

export type CustomInlineChordElement = {
  type: 'inline-chord'
  children?: CustomTypes['Text']
} & CustomChordType

export type ABCTablatureElement = {
  type: 'abc-tablature'
  previewer?: boolean
  children?: CustomTypes['Text']
}

export type GTPPreviewerElement = {
  type: 'gtp-previewer'
  children?: CustomTypes['Text']
}

export type CustomChordText = {
  text: string
  chord?: CustomChordType
}

export type ChordEditor = {
  insertInlineChord?: (taps: BoardChord, concise?: boolean) => void
  insertFixedChord?: (text: string, chord: CustomChordType) => void
}
