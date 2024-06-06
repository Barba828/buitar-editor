import { useEffect } from 'react'
import { Editor, Element, Text, Transforms } from 'slate'
import { ReactEditor, useSlate, useSlateStatic } from 'slate-react'
import { LIST_TYPES, OTHER_WRAP_TYPES } from '~/editor/plugins/config'

/**
 * 防止 WRAP_TYPES 的子元素出现TEXT
 * @param element
 * @returns
 */
const useFormatSubElement = (element: Element) => {
  const editor = useSlateStatic()
  if (!element?.children || !element.children?.length || element.type === 'paragraph') {
    return
  }
  if (OTHER_WRAP_TYPES.includes(element.type)) {
    /** OTHER_WRAP_TYPES 中文本子元素 需要替换为 paragraph */
    const { children } = element
    children.forEach((child) => {
      if (Text.isText(child)) {
        Transforms.setNodes(
          editor,
          {
            type: 'paragraph',
            children: [{ text: child.text }],
          },
          { at: ReactEditor.findPath(editor, child) }
        )
      }
    })
  } else if (LIST_TYPES.includes(element.type)) {
    /** LIST_TYPES 中文本子元素 需要替换为 list-item */
    const { children } = element
    children.forEach((child) => {
      if (Text.isText(child) || child.type !== 'list-item') {
        Transforms.setNodes(
          editor,
          {
            type: 'list-item',
            children: [{ text: Editor.string(editor, ReactEditor.findPath(editor, child)) }],
          },
          { at: ReactEditor.findPath(editor, child) }
        )
      }
    })
  }
}

/**
 * 防止文档内容为空数组[]
 */
const useFormatEmptyEditor = () => {
  const editor = useSlate()
  useEffect(() => {
    if (editor.children.length === 0) {
      editor.children = [{ type: 'paragraph', children: [{ text: '' }] }]
    }
  }, [editor.children.length])
}

export { useFormatSubElement, useFormatEmptyEditor }
