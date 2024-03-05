import type { BoardChord } from '@buitar/to-guitar'
import { type CustomTypes, Transforms } from 'slate'
import type { CustomInlineChordElement, CustomText } from './custom-types'

export const withChords = (editor: CustomTypes['Editor']) => {
  const { isInline, isVoid, markableVoid } = editor

  editor.isInline = (element: CustomTypes['Element']) => {
    return element.type === 'inline-chord' ? true : isInline(element)
  }

  editor.isVoid = (element: CustomTypes['Element']) => {
    return element.type === 'inline-chord' ? true : isVoid(element)
  }

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

  editor.insertFixedChord = (text: string, taps: BoardChord, concise?: boolean) => {
    if (!taps) {
      editor.insertText(text)
      return
    }
    const chord: CustomText = {
      taps,
      concise: !!concise,
      text: '',
    }
    Transforms.insertNodes(editor, chord)
    Transforms.move(editor)
  }

  return editor
}
