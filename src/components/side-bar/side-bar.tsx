import { FC, HTMLProps, useCallback } from 'react'
import { type FileData } from '~/utils/indexed-files'
import cx from 'classnames'

import './side-bar.scss'
import { Icon } from '~common'
import { useFilesContext } from '~/utils/use-files-context'

export const SideBar: FC<
  HTMLProps<HTMLDivElement> & {
    extend?: boolean
  }
> = ({ extend, ...props }) => {
  const { doc, setDoc, fileList, addFile, deleteFile } = useFilesContext()!

  const renderItem = useCallback(
    (item: FileData) => {
      return (
        <div
          key={item.id}
          onClick={() => setDoc(item)}
          className={cx(
            'side-bar__item',
            'flex-center',
            doc?.id === item.id && 'side-bar__item--active'
          )}
        >
          <div className='side-bar__item__title'> {item.title}</div>
          <div className="side-bar__item__icons flex-center">
            <Icon name="icon-remove" onClick={() => deleteFile(item.id)}></Icon>
          </div>
        </div>
      )
    },
    [deleteFile, doc?.id, setDoc]
  )

  return (
    <div className={cx('side-bar', 'print-hide', extend && 'side-bar--extend')} {...props}>
      <a
        className={cx('side-bar__item', 'side-bar__item--github', 'flex-center')}
        href="https://github.com/Barba828/buitar-editor"
      >
        <h2>Github</h2>
      </a>

      <div className={cx('side-bar__item', 'flex-center')} onClick={() => addFile()}>
        New Files...
        <Icon name="icon-add-plus" style={{ fontSize: '1.5em', opacity: 0.6 }}></Icon>
      </div>

      {fileList.map((item) => renderItem(item))}

      <a
        className={cx('side-bar__item', 'side-bar__item--github', 'flex-center')}
        href="https://github.com/Barba828/buitar-editor/issues"
      >
        Issues
      </a>
    </div>
  )
}
