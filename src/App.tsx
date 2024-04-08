import { CSSProperties, useCallback, useMemo, useState } from 'react'
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
import { withHistory } from 'slate-history'
import { withChords, InlineChordElement, FixedChordLeaf, SlashToolbar } from '../lib'
import { HoverToolbar } from './components/hover-toolbar'

import type { ParagraphElement } from './custom-types'

import './App.css'
// import yellowJson from './yellow.json'

const App = () => {
  const editor = useMemo(() => withChords(withHistory(withReact(createEditor()))), [])
  const [value] = useState<Descendant[]>([
    {
      type: 'paragraph',
      children: [
        { text: 'There is an empty chord card ' },
        // {
        //   type: 'inline-chord',
        //   children: [{ text: '' }],
        //   taps: { chordType: { name: '', name_zh: '', tag: '' }, chordTaps: [] },
        // },
        // { text: 'here' },
      ],
    },
    // ...(yellowJson as Descendant[]),
  ])

  const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, [])
  const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onChange = useCallback((_value: Descendant[]) => {
    // console.log(value)
  }, [])
  return (
    <Slate editor={editor} initialValue={value} onChange={onChange}>
      <Editable className="slate-editable" renderElement={renderElement} renderLeaf={renderLeaf} />
      <HoverToolbar />
      <SlashToolbar />
    </Slate>
  )
}

const Element = (props: RenderElementProps) => {
  const { element, attributes, children } = props
  const style = { textAlign: (element as ParagraphElement).align } as CSSProperties
  switch (element.type) {
    case 'inline-chord':
      return <InlineChordElement {...props} />
    case 'block-quote':
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      )
    case 'list-item':
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      )
    case 'numbered-list':
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      )
    case 'bulleted-list':
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      )
    case 'heading-1':
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      )
    case 'heading-2':
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      )
    case 'heading-3':
      return (
        <h3 style={style} {...attributes}>
          {children}
        </h3>
      )
    case 'heading-4':
      return (
        <h4 style={style} {...attributes}>
          {children}
        </h4>
      )
    case 'heading-5':
      return (
        <h5 style={style} {...attributes}>
          {children}
        </h5>
      )
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

export default App
