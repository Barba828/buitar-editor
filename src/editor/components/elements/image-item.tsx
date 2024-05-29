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
import { ButtonGroup, Modal } from '~common'

export const ImageItemElement: FC<RenderElementProps & HTMLProps<HTMLDivElement>> = ({
  attributes,
  children,
  element,
  ...divProps
}) => {
  const editor = useSlateStatic()
  const selected = useSelected()
  const focused = useFocused()
  const [showLink, setShowLink] = useState(false)
  const [url, setUrl] = useState((element as ImageElement).url)

  const handleRemove = useCallback(() => {
    Transforms.removeNodes(editor, { at: ReactEditor.findPath(editor, element) })
  }, [editor, element])

  const changeElementLink = useCallback(() => {
    Transforms.setNodes(editor, { url }, { at: ReactEditor.findPath(editor, element) })
  }, [editor, element, url])

  const btns = useMemo(
    () =>
      [
        {
          icon: 'icon-link-break',
          onClick: () => setShowLink(true),
        },
        { icon: 'icon-remove', onClick: handleRemove },
      ].filter((it) => !!it),
    [handleRemove]
  )

  const linkInputView = (
    <Modal
      visible={showLink}
      onVisibleChange={(value) => setShowLink(value)}
      onOk={changeElementLink}
      header="Change image url"
    >
      <input
        className="alpha-tab-element__input"
        contentEditable={true}
        placeholder="Input GTP file url"
        onChange={(e) => setUrl(e.target.value)}
        value={url}
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
        className={cx('relative group', {
          'select-element': selected && focused,
        })}
      >
        <img src={url} className={cx('block max-w-full max-h-100 rounded')} />
        <ButtonGroup
          className="absolute z-1 top-2 right-2 opacity-0 group-hover:opacity-100"
          btns={btns}
        >
          {linkInputView}
        </ButtonGroup>
      </div>
    </div>
  )
}
