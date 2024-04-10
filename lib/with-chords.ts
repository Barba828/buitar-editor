import type { BoardChord } from '@buitar/to-guitar'
import { type CustomTypes, Transforms, Editor } from 'slate'
import type { CustomInlineChordElement, CustomChordText } from './custom-types.d'

export const withChords = (editor: CustomTypes['Editor']) => {
  const { isInline, isVoid, markableVoid } = editor

  editor.isInline = (element: CustomTypes['Element']) => {
    return element.type === 'inline-chord' ? true : isInline(element)
  }
  editor.isVoid = (element: CustomTypes['Element']) => {
    return element.type === 'inline-chord' ? true : isVoid(element)
  }
  // editor.isElementReadOnly = (element: CustomTypes['Element']) => {
  //   return element.type === 'inline-chord' ? true : isElementReadOnly(element)
  // }
  // editor.isSelectable = (element: CustomTypes['Element']) => {
  //   return element.type === 'inline-chord' ? false : isSelectable(element)
  // }

  editor.markableVoid = (element: CustomTypes['Element']) => {
    return element.type === 'inline-chord' || markableVoid(element)
  }

  editor.insertInlineChord = (taps: BoardChord, concise?: boolean) => {
    const chord: CustomInlineChordElement = {
      type: 'inline-chord',
      taps,
      concise: !!concise,
      children: [{ text: '' }],
    }
    Transforms.insertNodes(editor, chord)
    Transforms.move(editor)
  }

  editor.insertFixedChord = (text: string, chord: CustomChordText['chord']) => {
    if (!chord || !chord.taps) {
      editor.insertText(text)
      return
    }
    const chordText: CustomChordText = {
      text: text.replace(/\n/g, '').trim(),
      chord: chord,
    }

    Transforms.insertNodes(editor, chordText)

    Editor.removeMark(editor, 'chord')
    editor.insertText(' ')
    Transforms.move(editor)
  }

  return editor
}
