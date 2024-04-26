import type { BaseEditor, Descendant } from 'slate'
import type { ReactEditor } from 'slate-react'
import type { HistoryEditor } from 'slate-history'

import type {
  CustomInlineChordElement,
  ABCTablatureElement,
  GTPPreviewerElement,
  CustomChordText,
  ChordEditor,
} from '~chord'

export type ParagraphElement = {
  type: 'paragraph'
  children: Descendant[]
}

export type BlockQuoteElement = {
  type: 'block-quote'
  extend?: boolean
  toggle?: CustomText[]
  children: Descendant[]
}

export type CodeBlockElement = {
  type: 'code-block'
  language: string
  children: Descendant[]
}

export type CodeLineElement = {
  type: 'code-line'
  children: Descendant[]
}

export type BulletedListElement = {
  type: 'bulleted-list'
  children: Descendant[]
}

export type OrderedListElement = {
  type: 'numbered-list'
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
  | CodeBlockElement
  | CodeLineElement
  | CheckListItemElement
  | HeadingElement
  | ImageElement
  | LinkElement
  | ListItemElement
  | OrderedListElement
  | ABCTablatureElement
  | CustomInlineChordElement
  | GTPPreviewerElement

export type BuitarEditor = {
  isList?: (format: BlockFormat) => boolean
  toggleMark?: (format: TextFormat) => void
  toggleBlock?: (element: Partial<CustomElement>) => void
  insertBlock?: (element: Partial<CustomElement>) => void
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
