import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { Descendant, Transforms, createEditor } from 'slate'
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
  ReactEditor,
} from 'slate-react'
import {
  InlineChordElement,
  FixedChordLeaf,
  InlineChordPopover,
  ABCElement,
  AlphaTabElement,
  TablatureElement,
} from '~chord'
import { CheckListItemElement } from '~/editor/components/elements/check-list-item'
import { SelectToolbar } from '~/editor/components/select-toolbar'
import { SlashToolbar } from '~/editor/components/slash-toolbar'
import { ToggleListItem } from '~/editor/components/elements/toggle-list-item'
import { useHoverToolbar } from '~/editor/hooks/use-hover-toolbar'
import { Placeholder } from '~/editor/components/placeholder/custom-placeholder.tsx'
import { withPlugins } from '~/editor/plugins'
import cx from 'classnames'

import './Editor.scss'
import './style/theme.scss'

const Editor: FC<{ defaultValue?: Descendant[] }> = ({ defaultValue }) => {
  const editor = useMemo(() => {
    const _editor = withPlugins(withReact(createEditor()))
    window.editor = _editor
    return _editor
  }, [])
  const [value, setValue] = useState<Descendant[]>(
    defaultValue || [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
          },
        ],
      },
    ]
  )
  const {
    attrs: { onMouseOver, onSelectionChange },
    hoverToolbar,
  } = useHoverToolbar(editor)

  useEffect(() => {
    if (defaultValue) {
      editor.children = defaultValue
      setValue(defaultValue)
      editor.deselect()
    }
  }, [defaultValue, editor])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleChange = useCallback((_value: Descendant[]) => {
    // console.log('debug _value', _value)
  }, [])

  const handleClickFooter = useCallback(() => {
    Transforms.insertNodes(
      editor,
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
      { at: editor.end([]) }
    )

    Transforms.select(editor, editor.end([]))
    ReactEditor.focus(editor)
  }, [editor])

  return (
    <Slate
      editor={editor}
      initialValue={value}
      onChange={handleChange}
      onSelectionChange={onSelectionChange}
    >
      <Editable
        className="slate-editable"
        onMouseOver={onMouseOver}
        renderElement={Element}
        renderLeaf={Leaf}
        spellCheck={false}
        autoFocus
      />
      <div className="slate-editable-footer" onClick={handleClickFooter}></div>

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
        </blockquote>
      )
    case 'numbered-list':
      return (
        <ol start={element.start} {...attributes}>
          {children}
        </ol>
      )
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>
    /** -------- 以下是基础类型（需要自定义Placeholder） -------- */
    case 'paragraph':
      return (
        <div {...attributes} className={cx('slate-element-paragraph', className)}>
          {children}
          <Placeholder element={element} />
        </div>
      )
    case 'list-item':
      return (
        <li {...attributes} className={className}>
          {children}
          <Placeholder element={element} />
        </li>
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
