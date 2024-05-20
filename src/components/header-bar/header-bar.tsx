import { FC, HTMLProps, useCallback, useMemo } from 'react'
import { Icon } from '~common'
import { useFilesContext } from '~/utils/use-files-context'

import './header-bar.scss'

export const HeaderBar: FC<
  HTMLProps<HTMLDivElement> & { extend?: boolean; onTriggerExtend?: () => void }
> = ({ extend, onTriggerExtend, ...props }) => {
  const { updateFile, addFile, doc } = useFilesContext()!
  const printFile = useCallback(() => {}, [])
  const saveFile = useCallback(() => {
    if (doc) {
      updateFile()
    } else {
      addFile(window.editor?.children)
    }
  }, [addFile, doc, updateFile])

  const createTime = useMemo(() => {
    const date = new Date(doc?.updateTime || doc?.createTime || new Date())
    return date.toLocaleString()
  }, [doc])

  return (
    <div className="header-bar flex-center" {...props}>
      <div className="flex-center" onClick={onTriggerExtend}>
        <Icon
          style={{ opacity: 0.8 }}
          name={extend ? 'icon-left-double' : 'icon-menu'}
          className="header-bar__icon"
        ></Icon>
        <div className="header-bar__title">
          <h1> {doc?.title || 'Buitar Editor'} </h1>
          <div className="header-bar__title__time">{createTime}</div>
        </div>
      </div>
      <div>
        <button onClick={printFile}>Print</button>
        <button onClick={saveFile}>Save</button>
      </div>
    </div>
  )
}
