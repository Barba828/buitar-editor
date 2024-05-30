/**
 * @refer https://github.com/ianstormtaylor/slate/blob/main/site/examples/images.tsx
 */
import { Editor, Transforms, Element } from 'slate'
import { ImageElement } from '~/custom-types'
import isUrl from 'is-url'
import imageExtensions from 'image-extensions'

const isImageUrl = (url: string) => {
  if (!url) return false
  if (!isUrl(url)) return false
  const ext = new URL(url).pathname.split('.').pop()
  return imageExtensions.includes(ext!)
}

const insertImage = (editor: Editor, url: string) => {
  const text = { text: '' }
  const image: ImageElement = { type: 'image', url, children: [text] }
  Transforms.insertNodes(editor, image)
  Transforms.insertNodes(editor, {
    type: 'paragraph',
    children: [{ text: '' }],
  })
}

export const withImages = (editor: Editor) => {
  const { insertData, isVoid } = editor

  editor.isVoid = (element: Element) => {
    return element.type === 'image' ? true : isVoid(element)
  }

  editor.insertData = (data) => {
    const text = data.getData('text/plain')
    const { files } = data

    /**
     * 1.处理粘贴image文件，使用fileReader读取二进制保存
     * @param data
     */
    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader()
        const [mime] = file.type.split('/')

        if (mime === 'image') {
          reader.addEventListener('load', () => {
            const url = reader.result as string
            insertImage(editor, url)
          })

          reader.readAsDataURL(file)
        }
      }
    } else if (isImageUrl(text)) {
      /**
       * 粘贴图片url
       */
      insertImage(editor, text)
    } else {
      insertData(data)
    }
  }

  return editor
}
