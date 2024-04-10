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
import {
  withChords,
  InlineChordElement,
  FixedChordLeaf,
  InlineChordPopover,
  ABCElement,
} from '~chord'
import { withOnChange } from './plugins/with-on-change'
import { withToggle } from './plugins/with-toggle'
import { CheckListItemElement } from './components/elements/check-list-item'
import { HoverToolbar } from './components/hover-toolbar'
import { SlashToolbar } from './components/slash-toolbar'

import type { ParagraphElement } from './custom-types'

import './App.scss'
import './style/theme.scss'

// import yellowJson from './yellow.json'

/**
 * 
 *  @TODO 解决包裹问题
 * 1. 不包裹，换行会新增block
 * 2. 包裹，无法通过退格以及换行移除block
 * 3. 处理需要「退格以及换行移除block」的元素，各种类型表现不一致
    {
      type: 'block-quote',
      children: [{ type: 'paragraph', children: [{ text: '77779999' }] }],
    }
    区别于
    {
      type: 'block-quote',
      children: [{ text: '77779999' }],
    },

 */

const App = () => {
  const editor = useMemo(
    () => withChords(withOnChange(withToggle(withHistory(withReact(createEditor()))))),
    []
  )
  const [value] = useState<Descendant[]>([
    {
      type: 'paragraph',
      children: [
        { text: 'There is an empty chord card ' },
        // {
        //   type: 'abc-tablature',
        //   children: [
        //     {
        //       text: `X:1
        //       T:The Legacy Jig
        //       M:6/8
        //       L:1/8
        //       R:jig
        //       K:G
        //       GFG BAB | gfg gab | GFG BAB | d2A AFD |
        //       GFG BAB | gfg gab | age edB |1 dBA AFD :|2 dBA ABd |:
        //       efe edB | dBA ABd | efe edB | gdB ABd |
        //       efe edB | d2d def | gfe edB |1 dBA ABd :|2 dBA AFD |]`,
        //     },
        //   ],
        // },
        // {
        //   type: 'inline-chord',
        //   children: [{ text: '' }],
        //   taps: { chordType: { name: '', name_zh: '', tag: '' }, chordTaps: [] },
        // },
        // { text: 'here' },
      ],
    },
    {
      type: 'abc-tablature',
      children: [{ type: 'paragraph', children: [{ text: '77779999' }] }],
    },
    {
      type: 'block-quote',
      children: [{ type: 'paragraph', children: [{ text: '77779999' }] }],
    },

    // ...(yellowJson as Descendant[]),
  ])

  const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, [])
  const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onChange = useCallback((_value: Descendant[]) => {
    console.log(_value)
  }, [])
  return (
    <Slate editor={editor} initialValue={value} onChange={onChange}>
      <Editable
        className="slate-editable"
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        spellCheck
        autoFocus
      />
      <HoverToolbar />
      <SlashToolbar />

      <InlineChordPopover />
    </Slate>
  )
}

const Element = (props: RenderElementProps) => {
  const { element, attributes, children } = props
  const style = { textAlign: (element as ParagraphElement).align } as CSSProperties
  switch (element.type) {
    case 'inline-chord':
      return <InlineChordElement {...props} />
    case 'abc-tablature':
      return <ABCElement {...props} />
    case 'check-list-item':
      return <CheckListItemElement {...props} />
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
        <ol style={style} start={element.start} {...attributes}>
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
    case 'heading-6':
      return (
        <h6 style={style} {...attributes}>
          {children}
        </h6>
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
