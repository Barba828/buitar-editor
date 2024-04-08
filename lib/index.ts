import './styles/index.scss'

export * from './custom-types.d'

export { withChords } from './with-chords'
export { InlineChordPopover } from './inline-chord-popover'
export { InputChordPopover } from './input-chord-popover'
export { SlashToolbar } from './slash-toolbar'

export * from './components/popover'
export * from './components/list'
export {
  InlineTapsItem as InlineChordElement,
  FixedTapsItem as FixedChordLeaf,
} from './components/taps-item'

export * from './utils/slate-utils'
