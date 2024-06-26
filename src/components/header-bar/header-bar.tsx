import { FC, HTMLProps, useCallback, useMemo } from 'react'
import { Icon } from '~common'
import { useFilesContext } from '~/utils/use-files-context'

import './header-bar.scss'

export const HeaderBar: FC<
  HTMLProps<HTMLDivElement> & { extend?: boolean; onTriggerExtend?: () => void }
> = ({ extend, onTriggerExtend, ...props }) => {
  const { updateFile, addFile, doc } = useFilesContext()!
  const printFile = useCallback(() => {
    window.print()
  }, [])
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
  }, [doc?.createTime, doc?.updateTime])

  return (
    <div className="header-bar flex-center print-hide" {...props}>
      <Icon
        style={{ opacity: 0.8 }}
        name={extend ? 'icon-left-double' : 'icon-menu'}
        className="header-bar__icon"
        onClick={onTriggerExtend}
      ></Icon>
      <div className="header-bar__title flex-1 w-0 text-ellipsis">
        <h1 className="text-ellipsis overflow-x-hidden whitespace-nowrap">
          {doc?.title || 'Buitar Editor'}
        </h1>
        <div className="header-bar__title__time">{createTime}</div>
      </div>
      <div>
        <button onClick={printFile}>Print</button>
        <button onClick={saveFile}>Save</button>
      </div>
    </div>
  )
}
