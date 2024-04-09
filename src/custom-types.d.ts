import type { BaseEditor, Descendant } from 'slate'
import type { ReactEditor } from 'slate-react'
import type { HistoryEditor } from 'slate-history'

import type { CustomInlineChordElement, CustomChordText, ChordEditor, BlockFormat } from '../lib'

export type ParagraphElement = {
  type: 'paragraph'
  align?: string
  children: Descendant[]
}

export type BlockQuoteElement = {
  type: 'block-quote'
  align?: string
  children: Descendant[]
}

export type BulletedListElement = {
  type: 'bulleted-list'
  align?: string
  children: Descendant[]
}

export type OrderedListElement = {
  type: 'numbered-list'
  align?: string
  start?: number
  children: Descendant[]
}

export type CheckListItemElement = {
  type: 'check-list-item'
  checked?: boolean
  children: Descendant[]
}

export type HeadingElement = {
  type: 'heading-1' | 'heading-2' | 'heading-3' | 'heading-4' | 'heading-5' | 'heading-6'
  align?: string
  children: Descendant[]
}

export type ImageElement = {
  type: 'image'
  url?: string
  children: CustomText[]
}

export type LinkElement = { type: 'link'; url?: string; children: Descendant[] }

export type ListItemElement = { type: 'list-item'; children: Descendant[] }

export type CustomElement =
  | ParagraphElement
  | BlockQuoteElement
  | BulletedListElement
  | CheckListItemElement
  | CustomInlineChordElement
  | HeadingElement
  | ImageElement
  | LinkElement
  | ListItemElement
  | OrderedListElement

export type BuitarEditor = {
  isList?: (format: BlockFormat) => boolean
  toggleMark?: (format: TextFormat) => void
  toggleBlock?: (format: BlockFormat) => void
}

export type CustomEditor = BuitarEditor & ChordEditor & BaseEditor & ReactEditor & HistoryEditor

export type CustomText = {
  bold?: boolean
  italic?: boolean
  code?: boolean
  underlined?: boolean
  strike?: boolean
  text: string
} & CustomChordText

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText
  }
}
