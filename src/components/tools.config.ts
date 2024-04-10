import { Element as SlateElement } from 'slate'

export type ToolType = {
  type: 'text' | 'chord'
  key: SlateElement['type']
  title: string
  desc: string
}

export const textTypeMenu: ToolType[] = [
  {
    type: 'text',
    key: 'paragraph',
    title: 'Text',
    desc: '',
  },
  {
    type: 'text',
    key: 'block-quote',
    title: 'Block quote',
    desc: '',
  },
  {
    type: 'text',
    key: 'numbered-list',
    title: 'Numbered list',
    desc: '',
  },
  {
    type: 'text',
    key: 'bulleted-list',
    title: 'Bulleted list',
    desc: '',
  },
  {
    type: 'text',
    key: 'check-list-item',
    title: 'Check List Item',
    desc: '',
  },
  {
    type: 'text',
    key: 'heading-1',
    title: 'Heading-1',
    desc: '',
  },
  {
    type: 'text',
    key: 'heading-2',
    title: 'Heading-2',
    desc: '',
  },
  {
    type: 'text',
    key: 'heading-3',
    title: 'Heading-3',
    desc: '',
  },
  {
    type: 'text',
    key: 'heading-4',
    title: 'Heading-4',
    desc: '',
  },
  {
    type: 'text',
    key: 'heading-5',
    title: 'Heading-5',
    desc: '',
  },
  {
    type: 'text',
    key: 'heading-6',
    title: 'Heading-6',
    desc: '',
  },
]

export const chordTypeMenu: ToolType[] = [
  {
    type: 'chord',
    key: 'block-quote',
    title: 'ABC Editor',
    desc: 'Simple music & tablature editor',
  },
  {
    type: 'chord',
    key: 'block-quote',
    title: 'GTP Previewer',
    desc: 'Add Guitar Pro tablature link',
  },
]
