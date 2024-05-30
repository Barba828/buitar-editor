/**
 * @refer https://github.com/ianstormtaylor/slate/blob/main/site/examples/embeds.tsx
 */
import { Editor } from 'slate'

export const withEmbeds = (editor: Editor) => {
  const { isVoid } = editor
  editor.isVoid = (element) =>
    element.type === 'video' ? true : element.type === 'bookmark' ? true : isVoid(element)
  return editor
}
