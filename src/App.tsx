import Editor from '~/editor/Editor'
import { SideBar } from '~/components/side-bar/side-bar'
import { HeaderBar } from '~/components/header-bar/header-bar'
import { useCallback, useEffect } from 'react'
import { FilesProvider, useFilesContext } from '~/utils/use-files-context'
import { Descendant } from 'slate'
import { debounce } from '~common/utils/debounce'
import { getTitle } from '~/editor/utils/get-title'

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
      await updateFile({
        ...doc,
        title,
        updateTime,
        values: _value,
      })

    }, 2000),
    [updateFile, doc]
  )

  useEffect

  return (
    <div className="buitar-editor__editor">
      <Editor defaultValue={doc?.values} onChange={handleChange}></Editor>
    </div>
  )
}

export default App
