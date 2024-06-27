import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { Descendant, Transforms, Range, createEditor } from 'slate'
import {
  Slate,
  Editable,
  withReact,
  RenderElementProps,
  DefaultElement,
  RenderLeafProps,
  DefaultLeaf,
  ReactEditor,
  useSlate,
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
import { ImageBlockElement } from '~/editor/components/elements/image-item'
import { VideoBlockElement } from '~/editor/components/elements/video-item'
import { BookmarkBlockElement } from '~/editor/components/elements/bookmark-item'
import { ToggleListItem } from '~/editor/components/elements/toggle-list-item'
import { SelectToolbar } from '~/editor/components/select-toolbar'
import { SlashToolbar } from '~/editor/components/slash-toolbar'
import { Placeholder } from '~/editor/components/placeholder/custom-placeholder.tsx'
import { HoverToolbar } from '~/editor/components/hover-toolbar'
import { withPlugins } from '~/editor/plugins'
import { EditableProvider, useEditableContext } from '~/editor/hooks/use-editable-context'
import { useFormatEmptyEditor, useFormatSubElement } from '~/editor/hooks/use-format-sub-element'
import { useHotkey } from '~/editor/hooks/use-hotkey'
import type { CustomElement } from '~/custom-types'
import cx from 'classnames'

import './Editor.scss'
import './style/theme.scss'
import { useTopSelected } from './hooks/use-top-selected'

const SlateEditor: FC<{
  defaultValue?: Descendant[]
  onChange?: (value: Descendant[]) => void
}> = ({ defaultValue, onChange }) => {
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

  useEffect(() => {
    // 切换doc时重置
    if (defaultValue) {
      editor.children = defaultValue
      setValue(defaultValue)
      editor.deselect()
    }
  }, [defaultValue, editor])

  return (
    <Slate editor={editor} initialValue={value} onChange={onChange}>
      <EditableProvider>
        <Editor />
      </EditableProvider>
    </Slate>
  )
}

const Editor = () => {
  const editor = useSlate()
  const { onCompositionStart, onCompositionEnd, onMouseOver, onSelect } = useEditableContext()!
  const { onKeyDown } = useHotkey()
  useFormatEmptyEditor()

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  /**
   * 如果末尾是非空行，插入一个空行
   */
  const handleClickAfter = useCallback(() => {
    const lastNode = editor.children?.[editor.children.length - 1]
    if (!editor.isEmpty(lastNode as CustomElement)) {
      Transforms.insertNodes(
        editor,
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
        { at: [editor.children.length] }
      )
    }
    Transforms.select(editor, editor.end([]))
    ReactEditor.focus(editor)
  }, [editor])
  /**
   * 如果首个节点是非空行，插入一个空行
   */
  const handleClickBefore = useCallback(() => {
    const fisrtNode = editor.children?.[0]
    if (!editor.isEmpty(fisrtNode as CustomElement)) {
      Transforms.insertNodes(
        editor,
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
        { at: [0] }
      )
    }

    Transforms.select(editor, [0])
    ReactEditor.focus(editor)
  }, [editor])
  return (
    <>
      <div className="slate-editable-before slate-editable-tip" onClick={handleClickBefore}>
        Add a new line
      </div>
      <Editable
        id="slate-editable"
        className="slate-editable"
        renderElement={Element}
        renderLeaf={Leaf}
        onMouseOver={onMouseOver}
        onSelect={onSelect}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
        spellCheck={false}
        autoFocus
      />
      <div className="slate-editable-after slate-editable-tip" onClick={handleClickAfter}>
        Add a new line
      </div>

      <SelectToolbar />
      <SlashToolbar />
      <HoverToolbar />

      <InlineChordPopover />
    </>
  )
}

const Element = (props: RenderElementProps) => {
  const isSelected = useTopSelected(props.element)
  const className = cx(isSelected && 'select-element')
  const { element, attributes, children } = props
  useFormatSubElement(element)
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
        <ol start={element.start} {...attributes} className={className}>
          {children}
        </ol>
      )
    case 'bulleted-list':
      return (
        <ul {...attributes} className={className}>
          {children}
        </ul>
      )
    case 'image':
      return <ImageBlockElement {...props} className={className} />
    case 'video':
      return <VideoBlockElement {...props} className={className} />
    case 'bookmark':
      return <BookmarkBlockElement {...props} className={className} />
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
  const editor = useSlate()
  const { selection } = editor
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

  if (leaf.link) {
    children = (
      <a
        onClick={(event) => {
          // 选择a标签文本时不要跳转
          if (selection && Range.isCollapsed(selection)) {
            event.preventDefault()
            window.open(leaf.link, '_blank')
          }
        }}
        href={leaf.link}
      >
        {children}
      </a>
    )
  }

  if (leaf.chord) {
    children = <FixedChordLeaf {...props}>{children}</FixedChordLeaf>
  }

  if (leaf.color) {
    children = (
      <span
        className={cx(
          leaf.color?.color,
          leaf.color?.background,
          leaf.color?.background && 'bg-opacity-40'
        )}
      >
        {children}
      </span>
    )
  }

  return <DefaultLeaf {...props}>{children}</DefaultLeaf>
}

export default SlateEditor
