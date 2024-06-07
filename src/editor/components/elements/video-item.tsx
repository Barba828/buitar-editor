import isUrl from 'is-url'
import { FC, HTMLProps, useCallback, useMemo, useState } from 'react'
import { Transforms } from 'slate'
import {
  ReactEditor,
  RenderElementProps,
  useSlateStatic,
} from 'slate-react'
import { VideoElement } from '~/custom-types'
import cx from 'classnames'
import { ButtonGroup, Icon, Modal } from '~common'

export const VideoBlockElement: FC<RenderElementProps & HTMLProps<HTMLDivElement>> = ({
  attributes,
  children,
  element,
  ...divProps
}) => {
  const editor = useSlateStatic()
  const originUrl = (element as VideoElement).url
  const [showModal, setShowModal] = useState(false)
  const [url, setUrl] = useState(originUrl)

  const handleRemove = useCallback(() => {
    Transforms.removeNodes(editor, { at: ReactEditor.findPath(editor, element) })
  }, [editor, element])

  const changeElementLink = useCallback(() => {
    Transforms.setNodes(editor, { url }, { at: ReactEditor.findPath(editor, element) })
  }, [editor, element, url])

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
      onOk={changeElementLink}
      header="Set embed page url"
    >
      <input
        contentEditable={true}
        placeholder="Input embed page url"
        className='primary-text-input'
        onChange={(e) => setUrl(e.target.value)}
        defaultValue={originUrl}
        autoFocus
        spellCheck={false}
      ></input>
    </Modal>
  )
  return (
    <div {...attributes} {...divProps}>
      <div className='hidden'>{children}</div>

      <div
        contentEditable={false}
        className={cx('relative group block-element-empty select-none')}
      >
        {originUrl ? (
          <div
            style={{
              padding: '75% 0 0 0',
              position: 'relative',
            }}
          >
            <iframe
              src={`${url}?title=0&byline=0&portrait=0`}
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
              }}
              className="border-0"
            />
          </div>
        ) : (
          <div
            onClick={() => setShowModal(true)}
            className="h-10 flex items-center justify-start pl-2"
          >
            <Icon name="icon-image" className="opacity-50 text-xl mr-2"></Icon>
            <div className="font-bold opacity-50 text-sm">Add an embed with url</div>
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
