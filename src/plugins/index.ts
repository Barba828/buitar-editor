import { withChords } from '~chord'
import { withHistory } from 'slate-history'
import { withOnChange } from './with-on-change'
import { withToggle } from './with-toggle'
import { withValidation } from './with-validation'

import { CustomEditor } from '../custom-types'

const plugins = [withHistory, withToggle, withOnChange, withValidation, withChords]

/**
 * @refer https://github.com/objectlegal/slate-snippets?tab=readme-ov-file#create-a-withplugins-hook--composer
 */
export const withPlugins = (editor: CustomEditor) => {
  for (const plugin in plugins) {
    if (typeof plugins[plugin] !== 'function') continue
    const pluginEditor = plugins[plugin](editor)
    if (pluginEditor !== editor) continue // Invalid plugin
    editor = pluginEditor
  }
  return editor
}
