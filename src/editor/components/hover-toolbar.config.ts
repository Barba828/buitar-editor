import { Editor } from 'slate'
import { CustomElement } from '~/custom-types'

export const typeList: CustomElement['type'][] = [
  'abc-tablature',
  'block-quote',
  'block-tablature',
  'bookmark',
  'bulleted-list',
  'check-list-item',
  'code-block',
  'code-line',
  'gtp-previewer',
  'heading-1',
  'heading-2',
  'heading-3',
  'heading-4',
  'heading-5',
  'heading-6',
  'image',
  'inline-chord',
  'link',
  'list-item',
  'numbered-list',
  'paragraph',
  'toogle-list',
  'video',
]

// @ts-expect-error 手动初始化
export const rectConfig: Record<
  CustomElement['type'],
  (rect: DOMRect, editor: Editor, isMouseDown?: boolean) => DOMRect
> = {}
const initRectConfig = () => {
  typeList.forEach((type) => {
    if (type === 'list-item') {
      rectConfig[type] = (rect: DOMRect) => ({
        ...rect,
        top: rect.top,
        height: rect.height || 30,
        left: rect.left - 16,
      })
    }
  })
}
