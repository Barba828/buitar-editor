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
import { withHistory } from 'slate-history'
import { withChords, InlineChordPopover, FixedChordPopover, InlineChordElement, FixedChordLeaf } from '../lib'

import './App.css'

const App = () => {
  const editor = useMemo(() => withChords(withHistory(withReact(createEditor()))), [])
  const [value] = useState<Descendant[]>([
    {
      type: 'paragraph',
      children: [
        { text: 'There is an empty chord card here' },
        {
          type: 'inline-chord',
          children: [{ text: '' }],
          taps: { chordType: { name: '', name_zh: '', tag: '' }, chordTaps: [] },
        },
        { text: ", try typing '/c' and 'G' to get the G chord in the sentence." },
      ],
    },
    {
      type: 'paragraph',
      children: [
        { text: 'This is ' },
        {
          text: 'G chord',
          underlined: true,
          taps: { chordType: { name: '', name_zh: '', tag: '' }, chordTaps: [] },
        },
        { text: ' popover.'},
      ],
    },
  ])
  // const { ChordPopover } = useInlineChord(editor)
  const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, [])
  const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, [])

  return (
    <Slate editor={editor} initialValue={value}>
      <Editable className="slate-editable" renderElement={renderElement} renderLeaf={renderLeaf} />
      <FixedChordPopover />
      <InlineChordPopover/>
    </Slate>
  )
}

const Element = (props: RenderElementProps) => {
  const { element } = props

  switch (element.type) {
    case 'inline-chord':
      return <InlineChordElement {...props} />
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

  if (leaf.taps) {
    children = <FixedChordLeaf {...props}>{children}</FixedChordLeaf>
  }

  return <DefaultLeaf {...props}>{children}</DefaultLeaf>
}

export default App
