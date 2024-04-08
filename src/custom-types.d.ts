import type { BaseEditor, Descendant } from 'slate'
import type { ReactEditor } from 'slate-react'
import type { HistoryEditor } from 'slate-history'

import type { CustomInlineChordElement, CustomChordText, ChordEditor } from '../lib'

export type ParagraphElement = {
  type: 'paragraph'
  align?: string
  children: Descendant[]
}

type BlockQuoteElement = {
  type: 'block-quote'
  align?: string
  children: Descendant[]
}

type BulletedListElement = {
  type: 'bulleted-list'
  align?: string
  children: Descendant[]
}

type OrderedListElement = {
  type: 'numbered-list'
  align?: string
  children: Descendant[]
}

type CheckListItemElement = {
  type: 'check-list-item'
  checked?: boolean
  children: Descendant[]
}

type HeadingElement = {
  type: 'heading-1' | 'heading-2' | 'heading-3' | 'heading-4' | 'heading-5'
  align?: string
  children: Descendant[]
}

type ImageElement = {
  type: 'image'
  url?: string
  children: CustomText[]
}

type LinkElement = { type: 'link'; url?: string; children: Descendant[] }

type ListItemElement = { type: 'list-item'; children: Descendant[] }

type CustomElement =
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

type CustomEditor = ChordEditor & BaseEditor & ReactEditor & HistoryEditor

type CustomText = {
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
