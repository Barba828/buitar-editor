import Editor from '~/editor/Editor'
import { SideBar } from '~/components/side-bar/side-bar'
import { HeaderBar } from '~/components/header-bar/header-bar'
import { useState } from 'react'
import { FilesProvider, useFilesContext } from '~/utils/use-files-context'

const App = () => {
  const [siderbarVisible, setSiderbarVisible] = useState(true)

  return (
    <FilesProvider>
      <div style={{ display: 'flex' }}>
        <SideBar extend={siderbarVisible}></SideBar>
        <div style={{ flex: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
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
    <div style={{ flex: 1, overflowY: 'scroll' }}>
      <Editor defaultValue={doc?.values}></Editor>
    </div>
  )
}

export default App
