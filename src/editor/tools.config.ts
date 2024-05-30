import { Element as SlateElement } from 'slate'

export type ToolType = {
  tag: 'text' | 'embed' | 'chord' | 'tablature'
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
    key: 'toogle-list',
    title: 'Toogle list',
    desc: 'Toogle can show and hide inside',
    icon: 'icon-list-toggle',
  },
  {
    tag: 'text',
    key: 'code-block',
    title: 'Code Block',
    desc: 'Code Blocks with syntax highlighting',
    icon: 'icon-code-block',
  },
  {
    tag: 'text',
    key: 'heading-1',
    title: 'Heading-1',
    desc: 'Largest heading size',
    icon: 'icon-heading-1',
  },
  {
    tag: 'text',
    key: 'heading-2',
    title: 'Heading-2',
    desc: 'Large heading size',
    icon: 'icon-heading-2',
  },
  {
    tag: 'text',
    key: 'heading-3',
    title: 'Heading-3',
    desc: 'Medium heading size',
    icon: 'icon-heading-3',
  },
  {
    tag: 'text',
    key: 'heading-4',
    title: 'Heading-4',
    desc: 'Small heading size',
    icon: 'icon-heading-4',
  },
  {
    tag: 'text',
    key: 'heading-5',
    title: 'Heading-5',
    desc: 'Smaller heading size',
    icon: 'icon-heading-5',
  },
  {
    tag: 'text',
    key: 'heading-6',
    title: 'Heading-6',
    desc: 'Smallest heading size',
    icon: 'icon-heading-6',
  },
]

export const embedTypeMenu: ToolType[] = [
  {
    tag: 'embed',
    key: 'image',
    title: 'Image',
    desc: 'Add embed image',
    icon: 'icon-image',
  },
  {
    tag: 'embed',
    key: 'video',
    title: 'Embed',
    desc: 'Embed page with a link',
    icon: 'icon-paperclip-attechment',
  },
  {
    tag: 'embed',
    key: 'bookmark',
    title: 'Page Bookmark',
    desc: 'Add page bookmark with a link',
    icon: 'icon-bookmark',
  },
]

export const tablatureTypeMenu: ToolType[] = [
  {
    tag: 'tablature',
    key: 'gtp-previewer',
    title: 'GTP Previewer',
    desc: 'Add Guitar Pro tablature link',
    icon: 'icon-guitar',
  },
  {
    tag: 'tablature',
    key: 'abc-tablature',
    title: 'ABC Editor',
    desc: 'Simple music & tablature editor',
    icon: 'icon-list-music',
  },
  {
    tag: 'tablature',
    key: 'block-tablature',
    title: 'Custom Tablature',
    desc: 'Tablature UI with custom and simple text',
    icon: 'icon-chord',
  },
]

export const chordTypeMenu: ToolType[] = [
  {
    tag: 'chord',
    key: '-CA',
    title: 'Inline Chord',
    desc: 'Insert Inline Chord',
    icon: 'icon-chord',
  },
  {
    tag: 'chord',
    key: '-X0',
    title: 'Inline Custom Chord',
    desc: 'Insert Inline Custom Chord',
    icon: 'icon-chord',
  },
  {
    tag: 'chord',
    key: '-TA',
    title: 'Fixed Chord',
    desc: 'Insert Fixed Chord',
    icon: 'icon-chord',
  },
  {
    tag: 'chord',
    key: '-Rx0',
    title: 'Fixed Custom Chord',
    desc: 'Insert Fixed Custom Chord',
    icon: 'icon-chord',
  },
]

export const flatTypeArr = [...textTypeMenu, ...tablatureTypeMenu, ...chordTypeMenu]

export const flatTypeMap = new Map<string, ToolType>()
flatTypeArr.forEach((tool) => {
  flatTypeMap.set(tool.key, tool)
})
