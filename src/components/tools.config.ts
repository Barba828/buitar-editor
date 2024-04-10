import { Element as SlateElement } from 'slate'

export type ToolType = {
  type: 'text' | 'chord' | 'tablature'
  key: SlateElement['type'] | string
  title: string
  desc: string
}
export const textTypeMenu: ToolType[] = [
  {
    type: 'text',
    key: 'paragraph',
    title: 'Text',
    desc: 'Basic paragraph text',
  },
  {
    type: 'text',
    key: 'block-quote',
    title: 'Block quote',
    desc: 'Highlight text with a block quote',
  },
  {
    type: 'text',
    key: 'numbered-list',
    title: 'Numbered list',
    desc: 'Organize content with a numbered list',
  },
  {
    type: 'text',
    key: 'bulleted-list',
    title: 'Bulleted list',
    desc: 'Organize content with a bulleted list',
  },
  {
    type: 'text',
    key: 'check-list-item',
    title: 'Todo list',
    desc: 'Track tasks with a todo list',
  },
  {
    type: 'text',
    key: 'heading-1',
    title: 'Heading-1',
    desc: 'Largest heading size',
  },
  {
    type: 'text',
    key: 'heading-2',
    title: 'Heading-2',
    desc: 'Large heading size',
  },
  {
    type: 'text',
    key: 'heading-3',
    title: 'Heading-3',
    desc: 'Medium heading size',
  },
  {
    type: 'text',
    key: 'heading-4',
    title: 'Heading-4',
    desc: 'Small heading size',
  },
  {
    type: 'text',
    key: 'heading-5',
    title: 'Heading-5',
    desc: 'Smaller heading size',
  },
  {
    type: 'text',
    key: 'heading-6',
    title: 'Heading-6',
    desc: 'Smallest heading size',
  },
]

export const tablatureTypeMenu: ToolType[] = [
  {
    type: 'tablature',
    key: 'block-quote',
    title: 'ABC Editor',
    desc: 'Simple music & tablature editor',
  },
  {
    type: 'tablature',
    key: 'block-quote',
    title: 'GTP Previewer',
    desc: 'Add Guitar Pro tablature link',
  },
]

export const chordTypeMenu: ToolType[] = [
  {
    type: 'chord',
    key: '-CA',
    title: 'Inline Chord',
    desc: 'Insert Inline Chord',
  },
  {
    type: 'chord',
    key: '-X0',
    title: 'Inline Custom Chord',
    desc: 'Insert Inline Custom Chord',
  },
  {
    type: 'chord',
    key: '-TA',
    title: 'Fixed Chord',
    desc: 'Insert Fixed Chord',
  },
  {
    type: 'chord',
    key: '-Rx0',
    title: 'Fixed Custom Chord',
    desc: 'Insert Fixed Custom Chord',
  },
]

export const flatTypeArr = [...textTypeMenu, ...tablatureTypeMenu, ...chordTypeMenu]
