import Editor from './Editor'

import './style/theme.scss'

const App = () => {
  return (
    <>
      <Editor></Editor>
      <a
        style={{ position: 'fixed', bottom: 50, right: 50, fontSize: '1.5em', fontWeight:'bold˝', opacity: '0.6' }}
        href="https://github.com/Barba828/buitar-editor"
      >
        Git
      </a>
    </>
  )
}
export default App
