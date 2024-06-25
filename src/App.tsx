import Editor from '~/editor/Editor'
import { SideBar } from '~/components/side-bar/side-bar'
import { HeaderBar } from '~/components/header-bar/header-bar'
import { useCallback, useRef } from 'react'
import { FilesProvider, useFilesContext } from '~/utils/use-files-context'
import { Descendant } from 'slate'
import { debounce } from '~common/utils/debounce'
import { FileData } from '~/utils/indexed-files'
import { getTitle } from '~/editor/utils/get-title'
import useMouse from 'react-use/lib/useMouse'

import './App.scss'
import useLocalStorage from 'react-use/lib/useLocalStorage'

const App = () => {
  const [siderbarVisible, setSiderbarVisible] = useLocalStorage<boolean>('siderbar-visible', true)

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
  const ref = useRef(null)
  const { docX, docY, posX, posY, elX, elY, elW, elH } = useMouse(ref)

  // const handleChange = useCallback(async (_value: Descendant[]) => {
  //   console.log('auto save', _value);
  // },
  // []
  // )
  /**自动保存 */
  const handleChange = useCallback(
    debounce(async (_value: Descendant[]) => {
      if (!doc) return
      console.log('auto save', _value)
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
    <div className="buitar-editor__editor" ref={ref}>
      <Editor defaultValue={doc?.values} onChange={handleChange}></Editor>
    </div>
  )
}

export default App
