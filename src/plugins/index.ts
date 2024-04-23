import { withChords } from '~chord'
import { withHistory } from 'slate-history'
import { withOnChange } from './with-on-change'
import { withToggle } from './with-toggle'

import { CustomEditor } from '../custom-types'

export const withPlugins = (editor: CustomEditor) => {
  return withChords(withOnChange(withToggle(withHistory(editor))))
}
