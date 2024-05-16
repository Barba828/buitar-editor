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
  useFocused,
  useSelected,
} from 'slate-react'
import {
  InlineChordElement,
  FixedChordLeaf,
  InlineChordPopover,
  ABCElement,
  AlphaTabElement,
  TablatureElement,
} from '~chord'
import { CheckListItemElement } from './components/elements/check-list-item'
import { SelectToolbar } from './components/select-toolbar'
import { SlashToolbar } from './components/slash-toolbar'
import { ToggleListItem } from './components/elements/toggle-list-item'
import { useHoverToolbar } from './hooks/use-hover-toolbar'
import { Placeholder } from './components/placeholder/custom-placeholder.tsx'
import { withPlugins } from './plugins'
import cx from 'classnames'

import './Editor.scss'

const Editor = () => {
  const editor = useMemo(() => withPlugins(withReact(createEditor())), [])
  window.editor = editor
  const [value] = useState<Descendant[]>([
    {
      type: 'paragraph',
      children: [
        {
          text: '撒打算打算',
        },
      ],
    },
    // {
    //   type: 'block-tablature',
    //   horizontal: false,
    //   children: [
    //     {
    //       type: 'paragraph',
    //       children: [
    //         {
    //           text: '',
    //         },
    //       ],
    //     },
    //   ],
    // },
    // {
    //   type: 'paragraph',
    //   children: [
    //     { text: '撒打算打算' },
    //     {
    //       type: 'inline-chord',
    //       taps: {
    //         chordType: {
    //           key: 34,
    //           tone: 9,
    //           over: 9,
    //           tag: 'm',
    //           name: 'minor triad',
    //           constitute: ['1', '3b', '5'],
    //           name_zh: '小三和弦',
    //         },
    //         chordTaps: [
    //           {
    //             tone: 9,
    //             pitch: 9,
    //             note: 'A',
    //             interval: 6,
    //             level: 2,
    //             string: 2,
    //             grade: 0,
    //             index: 17,
    //           },
    //           {
    //             tone: 4,
    //             pitch: 16,
    //             note: 'E',
    //             interval: 3,
    //             level: 3,
    //             string: 3,
    //             grade: 2,
    //             index: 36,
    //           },
    //           {
    //             tone: 9,
    //             pitch: 21,
    //             note: 'A',
    //             interval: 6,
    //             level: 3,
    //             string: 4,
    //             grade: 2,
    //             index: 53,
    //           },
    //           {
    //             tone: 0,
    //             pitch: 24,
    //             note: 'C',
    //             interval: 1,
    //             level: 4,
    //             string: 5,
    //             grade: 1,
    //             index: 69,
    //           },
    //           {
    //             tone: 4,
    //             pitch: 28,
    //             note: 'E',
    //             interval: 3,
    //             level: 4,
    //             string: 6,
    //             grade: 0,
    //             index: 85,
    //           },
    //         ],
    //       },
    //       concise: false,
    //       children: [
    //         {
    //           text: '',
    //         },
    //       ],
    //     },
    //   ],
    // },
    // {
    //   type: 'gtp-previewer',
    //   link: '',
    //   // link: '/canon.gp',
    //   children: [{ text: '' }],
    // },
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
  const { attrs: hoverToolbarAttrs, hoverToolbar } = useHoverToolbar(editor)

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

      {hoverToolbar}
      <InlineChordPopover />
    </Slate>
  )
}

const Element = (props: RenderElementProps) => {
  const selected = useSelected()
  const focused = useFocused()
  const isSelected = selected && !focused
  const className = cx(isSelected && 'slate-element-selected')
  const { element, attributes, children } = props
  switch (element.type) {
    case 'paragraph':
      return (
        <p {...attributes} className={className}>
          {children}
          <Placeholder element={element} />
        </p>
      )
    case 'inline-chord':
      return <InlineChordElement {...props} />
    case 'block-tablature':
      return <TablatureElement {...props} />
    case 'abc-tablature':
      return <ABCElement {...props} />
    case 'gtp-previewer':
      return <AlphaTabElement {...props} />
    case 'check-list-item':
      return <CheckListItemElement {...props} className={className} />
    case 'toogle-list':
      return <ToggleListItem {...props} className={className} />
    case 'block-quote':
      return (
        <blockquote {...attributes} className={className}>
          {children}
          <Placeholder element={element} />
        </blockquote>
      )
    case 'list-item':
      return (
        <li {...attributes} className={className}>
          {children}
          <Placeholder element={element} />
        </li>
      )
    case 'numbered-list':
      return (
        <ol start={element.start} {...attributes}>
          {children}
          <Placeholder element={element} />
        </ol>
      )
    case 'bulleted-list':
      return (
        <ul {...attributes}>
          {children}
          <Placeholder element={element} />
        </ul>
      )
    case 'heading-1':
      return (
        <h1 {...attributes} className={className}>
          {children}
          <Placeholder element={element} />
        </h1>
      )
    case 'heading-2':
      return (
        <h2 {...attributes} className={className}>
          {children}
          <Placeholder element={element} />
        </h2>
      )
    case 'heading-3':
      return (
        <h3 {...attributes} className={className}>
          {children}
          <Placeholder element={element} />
        </h3>
      )
    case 'heading-4':
      return (
        <h4 {...attributes} className={className}>
          {children}
          <Placeholder element={element} />
        </h4>
      )
    case 'heading-5':
      return (
        <h5 {...attributes} className={className}>
          {children}
          <Placeholder element={element} />
        </h5>
      )
    case 'heading-6':
      return (
        <h6 {...attributes} className={className}>
          {children}
          <Placeholder element={element} />
        </h6>
      )
    default:
      return (
        <DefaultElement {...props}>
          {children}
          <Placeholder element={element} />
        </DefaultElement>
      )
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
