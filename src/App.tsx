import Editor from '~/editor/Editor'
import { SideBar } from '~/components/side-bar/side-bar'
import { HeaderBar } from '~/components/header-bar/header-bar'
import { useState } from 'react'
import { FilesProvider, useFilesContext } from '~/utils/use-files-context'

import './App.scss'

const App = () => {
  const [siderbarVisible, setSiderbarVisible] = useState(true)

  return (
    <FilesProvider>
      <div className='buitar-editor'>
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
  const { doc } = useFilesContext()!

  return (
    <div className='buitar-editor__editor'>
      <Editor defaultValue={doc?.values}></Editor>
    </div>
  )
}

export default App
