import type { CustomTypes, Element as SlateElement, Editor } from 'slate'

declare global {
  type TextFormat = keyof Omit<CustomTypes['Text'], 'text'>
  type BlockFormat = SlateElement['type']

  interface Window {
    editor?: Editor
  }
}
