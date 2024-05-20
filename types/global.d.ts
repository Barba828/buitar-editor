import type { CustomTypes, Element as SlateElement, Editor } from 'slate'
import type { IndexedDBManager } from '~common/utils/indexedDB'
declare global {
  type TextFormat = keyof Omit<CustomTypes['Text'], 'text'>
  type BlockFormat = SlateElement['type']

  interface Window {
    editor?: Editor
    slate?: EditorInterface
    dbManager?: IndexedDBManager
  }
}
