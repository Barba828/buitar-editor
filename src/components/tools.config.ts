import { Element as SlateElement } from 'slate'

export type ToolType = {
  tag: 'text' | 'chord' | 'tablature'
  key: SlateElement['type'] | string
  title: string
  desc: string
  icon?: string
}
export const textTypeMenu: ToolType[] = [
  {
    tag: 'text',
    key: 'paragraph',
    title: 'Text',
    desc: 'Basic paragraph text',
    icon: 'icon-font',
  },
  {
    tag: 'text',
    key: 'block-quote',
    title: 'Block quote',
    desc: 'Highlight text with a block quote',
    icon: 'icon-list-toggle',
  },
  {
    tag: 'text',
    key: 'numbered-list',
    title: 'Numbered list',
    desc: 'Organize content with a numbered list',
    icon: 'icon-list-ol',
  },
  {
    tag: 'text',
    key: 'bulleted-list',
    title: 'Bulleted list',
    desc: 'Organize content with a bulleted list',
    icon: 'icon-list-bulleted-dec',
  },
  {
    tag: 'text',
    key: 'check-list-item',
    title: 'Todo list',
    desc: 'Track tasks with a todo list',
    icon: 'icon-list-todo',
  },
  {
    tag: 'text',
    key: 'heading-1',
    title: 'Heading-1',
    desc: 'Largest heading size',
    icon: 'icon-heading-2',
  },
  {
    tag: 'text',
    key: 'heading-2',
    title: 'Heading-2',
    desc: 'Large heading size',
    icon: 'icon-list-toggle',
  },
  {
    tag: 'text',
    key: 'heading-3',
    title: 'Heading-3',
    desc: 'Medium heading size',
    icon: 'icon-list-toggle',
  },
  {
    tag: 'text',
    key: 'heading-4',
    title: 'Heading-4',
    desc: 'Small heading size',
    icon: 'icon-list-toggle',
  },
  {
    tag: 'text',
    key: 'heading-5',
    title: 'Heading-5',
    desc: 'Smaller heading size',
    icon: 'icon-list-toggle',
  },
  {
    tag: 'text',
    key: 'heading-6',
    title: 'Heading-6',
    desc: 'Smallest heading size',
    icon: 'icon-list-toggle',
  },
]

export const tablatureTypeMenu: ToolType[] = [
  {
    tag: 'tablature',
    key: 'abc-tablature',
    title: 'ABC Editor',
    desc: 'Simple music & tablature editor',
  },
  {
    tag: 'tablature',
    key: 'block-quote',
    title: 'GTP Previewer',
    desc: 'Add Guitar Pro tablature link',
  },
]

export const chordTypeMenu: ToolType[] = [
  {
    tag: 'chord',
    key: '-CA',
    title: 'Inline Chord',
    desc: 'Insert Inline Chord',
  },
  {
    tag: 'chord',
    key: '-X0',
    title: 'Inline Custom Chord',
    desc: 'Insert Inline Custom Chord',
  },
  {
    tag: 'chord',
    key: '-TA',
    title: 'Fixed Chord',
    desc: 'Insert Fixed Chord',
  },
  {
    tag: 'chord',
    key: '-Rx0',
    title: 'Fixed Custom Chord',
    desc: 'Insert Fixed Custom Chord',
  },
]

export const flatTypeArr = [...textTypeMenu, ...tablatureTypeMenu, ...chordTypeMenu]
