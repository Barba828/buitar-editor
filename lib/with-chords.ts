import type { BoardChord } from '@buitar/to-guitar'
import { type CustomTypes, Transforms, Editor } from 'slate'
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

  editor.insertFixedChord = (text: string, chord: CustomText['chord']) => {
    if (!chord || !chord.taps) {
      editor.insertText(text)
      return
    }
    const chordText: CustomText = {
      text: text,
      chord: chord,
    }

    Transforms.insertNodes(editor, chordText)

    Editor.removeMark(editor, 'underlined')
    Editor.removeMark(editor, 'chord')

    editor.insertText(' ') // 插入空格并移除 underlined 等效果
    Transforms.move(editor)
  }

  return editor
}
