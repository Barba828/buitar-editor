import './styles/index.scss'

export * from './custom-types.d'

export { withChords } from './with-chords'
export { InlineChordPopover } from './inline-chord-popover'
export { InputChordPopover } from './input-chord-popover'

export * from './components/popover'
export * from './components/list'
export * from './components/list-item'
export {
  InlineTapsItem as InlineChordElement,
  FixedTapsItem as FixedChordLeaf,
} from './components/taps-item'

export * from './utils/slate-utils'
export * from './hooks/use-inline-chord-popover'
