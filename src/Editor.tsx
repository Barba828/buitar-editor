import { useCallback, useMemo, useState } from 'react'
import { Descendant, createEditor } from 'slate'
import {
  Slate,
  Editable,
  withReact,
  RenderElementProps,
  DefaultElement,
  RenderLeafProps,
  DefaultLeaf,
} from 'slate-react'
import { InlineChordElement, FixedChordLeaf, InlineChordPopover, ABCElement } from '~chord'
import { CheckListItemElement } from './components/elements/check-list-item'
import { SelectToolbar } from './components/select-toolbar'
import { SlashToolbar } from './components/slash-toolbar'
import { ToggleListItem } from './components/elements/toggle-list-item'
import { useHoverToolbar } from './hooks/use-hover-toolbar'
import { withPlugins } from './plugins'

import './Editor.scss'

const Editor = () => {
  const editor = useMemo(() => withPlugins(withReact(createEditor())), [])
  window.editor = editor
  const [value] = useState<Descendant[]>([
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
    // {
    //   type: 'paragraph',
    //   children: [
    //     { text: 'There is an empty chord card ' },
    //     {
    //       type: 'inline-chord',
    //       children: [{ text: '' }],
    //       taps: { chordType: { name: '', name_zh: '', tag: '' }, chordTaps: [] },
    //     },
    //     { text: 'here' },
    //   ],
    // },
    // {
    //   type: 'toogle-list',
    //   extend: true,
    //   children: [{ type: 'paragraph', children: [{ text: '77779999' }] }],
    // },
    // ...(yellowJson as Descendant[]),
    // ...(ABCJson as Descendant[]),
  ])
  const { attrs: hoverToolbarAttrs, HoverToolbar } = useHoverToolbar(editor)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleChange = useCallback((_value: Descendant[]) => {
    hoverToolbarAttrs?.onInput()
    console.log('debug _value', _value)
    // console.log(editor)
  }, [])

  return (
    <Slate editor={editor} initialValue={value} onChange={handleChange}>
      <Editable
        className="slate-editable"
        {...hoverToolbarAttrs}
        renderElement={Element}
        renderLeaf={Leaf}
        spellCheck={false}
        autoFocus
      />
      <SelectToolbar />
      <SlashToolbar />

      <HoverToolbar />
      <InlineChordPopover />
    </Slate>
  )
}

const Element = (props: RenderElementProps) => {
  const { element, attributes, children } = props
  switch (element.type) {
    case 'inline-chord':
      return <InlineChordElement {...props} />
    case 'abc-tablature':
      return <ABCElement {...props} />
    case 'check-list-item':
      return <CheckListItemElement {...props} />
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>
    case 'toogle-list':
      return <ToggleListItem {...props} />
    case 'list-item':
      return <li {...attributes}>{children}</li>
    case 'numbered-list':
      return (
        <ol start={element.start} {...attributes}>
          {children}
        </ol>
      )
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>
    case 'heading-1':
      return <h1 {...attributes}>{children}</h1>
    case 'heading-2':
      return <h2 {...attributes}>{children}</h2>
    case 'heading-3':
      return <h3 {...attributes}>{children}</h3>
    case 'heading-4':
      return <h4 {...attributes}>{children}</h4>
    case 'heading-5':
      return <h5 {...attributes}>{children}</h5>
    case 'heading-6':
      return <h6 {...attributes}>{children}</h6>
    default:
      return <DefaultElement {...props} />
  }
}

const Leaf = (props: RenderLeafProps) => {
  const { leaf } = props
  let { children } = props

  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underlined) {
    children = <u>{children}</u>
  }

  if (leaf.strike) {
    children = <s>{children}</s>
  }

  if (leaf.code) {
    children = <code>{children}</code>
  }

  if (leaf.chord) {
    children = <FixedChordLeaf {...props}>{children}</FixedChordLeaf>
  }

  return <DefaultLeaf {...props}>{children}</DefaultLeaf>
}

export default Editor
