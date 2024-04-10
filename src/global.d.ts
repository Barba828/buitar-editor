import type { CustomTypes, CustomElement } from 'slate'

declare global {
  type TextFormat = keyof Omit<CustomTypes['Text'], 'text'>
  type BlockFormat = CustomElement['type']
}
