import Editor from '~/editor/Editor'
import { SideBar } from '~/components/side-bar/side-bar'
import { HeaderBar } from '~/components/header-bar/header-bar'
import { useCallback, useState } from 'react'
import { FilesProvider, useFilesContext } from '~/utils/use-files-context'
import { Descendant } from 'slate'
import { debounce } from '~common/utils/debounce'
import { FileData } from '~/utils/indexed-files'
import { getTitle } from '~/editor/utils/get-title'

import './App.scss'

const App = () => {
  const [siderbarVisible, setSiderbarVisible] = useState(true)

  return (
    <FilesProvider>
      <div className="buitar-editor">
        <SideBar extend={siderbarVisible}></SideBar>
        <div className="buitar-content">
          <HeaderBar
            extend={siderbarVisible}
            onTriggerExtend={() => setSiderbarVisible(!siderbarVisible)}
          ></HeaderBar>
          <EditorView />
        </div>
      </div>
    </FilesProvider>
  )
}

const EditorView = () => {
  const { doc, updateFile } = useFilesContext()!

  /**自动保存 */
  const handleChange = useCallback(
    debounce(async (_value: Descendant[]) => {
      console.log('auto save', _value);
      const title = getTitle(_value)
      const updateTime = new Date().getTime()
      const updateDoc = {
        ...doc,
        updateTime,
        title,
        values: _value,
      } as FileData
      await updateFile(updateDoc)
    }, 2000),
    [updateFile]
  )

  return (
    <div className="buitar-editor__editor">
      <Editor defaultValue={doc?.values} onChange={handleChange}></Editor>
    </div>
  )
}

export default App
