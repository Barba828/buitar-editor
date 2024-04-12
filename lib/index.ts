import './styles/index.scss'

export * from './chord-types.d'

export { withChords } from './with-chords'
export { InlineChordPopover } from './inline-chord-popover'
export { InputChordPopover } from './input-chord-popover'
export { ABCElement } from './abc-element'

export * from './components/popover'
export * from './components/list'
export * from './components/list-item'
export * from './search-list'
export {
  InlineTapsItem as InlineChordElement,
  FixedTapsItem as FixedChordLeaf,
} from './components/taps-item'

export * from './hooks/use-inline-chord-popover'
