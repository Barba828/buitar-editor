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
      children: [
        { text: 'There is an empty chord card here' },
        {
          type: 'inline-chord',
          children: [{ text: '' }],
          taps: { chordType: { name: '', name_zh: '', tag: '' }, chordTaps: [] },
        },
        { text: ", try typing '/c' and 'G' to get the G chord in the sentence." },
      ],
    }
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
