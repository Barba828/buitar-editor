import { useCallback, useMemo, useState } from 'react'
import { Descendant, createEditor } from 'slate'
import { Slate, Editable, withReact, RenderElementProps, DefaultElement } from 'slate-react'
import { withHistory } from 'slate-history'
import { withChords, useInlineChord, ChordElement } from '../lib'

import './App.css'

const App = () => {
  const editor = useMemo(() => withChords(withHistory(withReact(createEditor()))), [])
  const [value] = useState<Descendant[]>([
    {
      type: 'paragraph',
      children: [{ text: 'A line of text in a paragraph.' }],
    },
  ])
  const { ChordPopover } = useInlineChord(editor)
  const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, [])

  return (
    <Slate editor={editor} initialValue={value}>
      <Editable className="slate-editable" renderElement={renderElement} />
      <ChordPopover />
    </Slate>
  )
}

const Element = (props: RenderElementProps) => {
  const { element } = props

  switch (element.type) {
    case 'inline-chord':
      return <ChordElement {...props} />
    default:
      return <DefaultElement {...props} />
  }
}

export default App
