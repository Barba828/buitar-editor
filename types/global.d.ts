import type { CustomTypes, Element as SlateElement } from 'slate'

declare global {
  type TextFormat = keyof Omit<CustomTypes['Text'], 'text'>
  type BlockFormat = SlateElement['type']
}
