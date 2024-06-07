import { FC, HTMLProps, useCallback, useMemo, useState } from 'react'
import { Transforms } from 'slate'
import {
  RenderElementProps,
  useSlateStatic,
  ReactEditor,
} from 'slate-react'
import type { ImageElement } from '~/custom-types'
import cx from 'classnames'
import { ButtonGroup, Icon, Modal } from '~common'
import isUrl from 'is-url'

export const ImageBlockElement: FC<RenderElementProps & HTMLProps<HTMLDivElement>> = ({
  attributes,
  children,
  element,
  ...divProps
}) => {
  const editor = useSlateStatic()
  const [showModal, setShowModal] = useState(false)
  const originUrl = (element as ImageElement).url
  const [url, setUrl] = useState(originUrl && originUrl.startsWith('data:') ? '' : originUrl)

  const handleRemove = useCallback(() => {
    Transforms.removeNodes(editor, { at: ReactEditor.findPath(editor, element) })
  }, [editor, element])

  const changeElementLink = useCallback(
    (targetUrl?: string) => {
      Transforms.setNodes(editor, { url: targetUrl }, { at: ReactEditor.findPath(editor, element) })
    },
    [editor, element]
  )

  const handleloadFile: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      if (file) {
        // setLink(URL.createObjectURL(file))
        const reader = new FileReader()
        reader.onload = () => {
          changeElementLink(reader.result as string)
          setShowModal(false)
        }
        reader.readAsDataURL(file)
      }
    },
    [changeElementLink]
  )

  const btns = useMemo(
    () =>
      [
        isUrl(originUrl) && {
          icon: 'icon-right-top',
          onClick: () => {
            window.open(originUrl, '_blank')
          },
        },
        {
          icon: 'icon-edit',
          onClick: () => setShowModal(true),
        },
        { icon: 'icon-remove', onClick: handleRemove },
      ].filter((it) => !!it),
    [handleRemove, originUrl]
  )

  const linkInputView = (
    <Modal
      visible={showModal}
      onVisibleChange={(value) => setShowModal(value)}
      onOk={() => changeElementLink(url)}
      header="Change image url"
    >
      <input
        contentEditable={true}
        placeholder="Input image url"
        className="primary-text-input"
        onChange={(e) => setUrl(e.target.value)}
        value={url}
        autoFocus
        spellCheck={false}
      ></input>
      <label htmlFor="fileInput" className="primary-file-input">
        <Icon name="icon-paperclip-attechment"></Icon>
        <div className="text-sm ml-2"> Upload local GTP file</div>
        <input type="file" id="fileInput" accept="image/*" onChange={handleloadFile} />
      </label>
    </Modal>
  )
  return (
    <div {...attributes} {...divProps}>
      <div className="hidden">{children}</div>
      <div
        contentEditable={false}
        className={cx(
          'relative group block-element-empty select-none',
          originUrl ? 'w-fit' : 'w-full'
        )}
      >
        {originUrl ? (
          <img src={originUrl} className={cx('block max-w-full max-h-100 min-h-10 min-w-96 ')} />
        ) : (
          <div
            onClick={() => setShowModal(true)}
            className="h-10 flex items-center justify-start pl-2"
          >
            <Icon name="icon-image" className="opacity-50 text-xl mr-2"></Icon>
            <div className="font-bold opacity-50 text-sm">Add an Image</div>
          </div>
        )}
        <ButtonGroup
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
          btns={btns}
        >
          {linkInputView}
        </ButtonGroup>
      </div>
    </div>
  )
}
