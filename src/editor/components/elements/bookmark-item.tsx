import isUrl from 'is-url'
import { FC, HTMLProps, useCallback, useMemo, useState } from 'react'
import { Transforms } from 'slate'
import {
  ReactEditor,
  RenderElementProps,
  useFocused,
  useSelected,
  useSlateStatic,
} from 'slate-react'
import type { BookmarkElement } from '~/custom-types'
import cx from 'classnames'
import { ButtonGroup, Icon, Modal, Skeleton } from '~common'
import { fetchMetadata } from '~/editor/utils/urls'

export const BookmarkBlockElement: FC<RenderElementProps & HTMLProps<HTMLDivElement>> = ({
  attributes,
  children,
  element,
  ...divProps
}) => {
  const editor = useSlateStatic()
  const { url: originUrl, title, description, image } = element as BookmarkElement
  const selected = useSelected()
  const focused = useFocused()
  const [showModal, setShowModal] = useState(false)
  const [metaLoading, setMetaLoading] = useState(false) // 请求bookmark meta信息
  const [url, setUrl] = useState(originUrl)

  const handleRemove = useCallback(() => {
    Transforms.removeNodes(editor, { at: ReactEditor.findPath(editor, element) })
  }, [editor, element])

  const changeElementLink = useCallback(async () => {
    setMetaLoading(true)
    try {
      const { title, description, image, url: metaUrl } = await fetchMetadata(url)

      Transforms.setNodes(
        editor,
        { url: metaUrl, title, description, image },
        { at: ReactEditor.findPath(editor, element) }
      )
    } catch (e) {
      /**do nothing */
    } finally {
      setMetaLoading(false)
    }
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

  const emptyView = (
    <div onClick={() => setShowModal(true)} className="h-10 flex items-center justify-start px-2">
      <Icon name="icon-bookmark" className="opacity-50 text-xl mr-2"></Icon>
      <div className="font-bold opacity-50 text-sm">Add an bookmark with url</div>
    </div>
  )

  const loadingView = <div className='p-4'><Skeleton line={2}></Skeleton></div>

  const bookmarkView = (
    <a
      className="flex h-24 group-hover:text-zinc-600 dark:group-hover:text-zinc-200"
      href={originUrl}
      target="_blank"
    >
      <div className="flex-1 p-2 flex flex-col">
        <div className="text-sm line-clamp-1 font-bold">{title}</div>
        <div className="text-xs line-clamp-2 my-1">{description}</div>
        <div className="text-xs line-clamp-1 mt-auto">{url}</div>
      </div>
      <img src={image} className="h-24" alt={title}></img>
    </a>
  )

  return (
    <div {...attributes} {...divProps}>
      {children}
      <div
        contentEditable={false}
        className={cx(
          'relative group cursor-pointer my-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-300 hover:text-zinc-600 dark:hover:text-zinc-200',
          {
            'select-element': selected && focused,
          }
        )}
      >
        {metaLoading ? loadingView : originUrl ? bookmarkView : emptyView}
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
