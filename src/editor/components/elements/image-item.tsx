import { FC, HTMLProps, useCallback, useMemo, useState } from 'react'
import { Transforms } from 'slate'
import {
  RenderElementProps,
  useSlateStatic,
  ReactEditor,
  useSelected,
  useFocused,
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
  const selected = useSelected()
  const focused = useFocused()
  const [showModal, setShowModal] = useState(false)
  const originUrl = (element as ImageElement).url
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
      header="Change image url"
    >
      <input
        className="alpha-tab-element__input"
        contentEditable={true}
        placeholder="Input GTP file url"
        onChange={(e) => setUrl(e.target.value)}
        defaultValue={originUrl}
        autoFocus
        spellCheck={false}
      ></input>
    </Modal>
  )
  return (
    <div {...attributes} {...divProps}>
      {children}
      <div
        contentEditable={false}
        className={cx(
          'relative group cursor-pointer my-4 rounded overflow-hidden bg-gray-100 dark:bg-zinc-800',
          {
            'select-element': selected && focused,
          },
          originUrl ? 'w-fit' : 'w-full'
        )}
      >
        {originUrl ? (
          <img
            src={originUrl}
            className={cx(
              'block max-w-full max-h-100 min-h-10 min-w-96 '
            )}
          />
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
