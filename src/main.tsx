import React from 'react'
import ReactDOM from 'react-dom/client'
import * as slate from 'slate'
import { fileDbManager} from '~/utils/indexed-files.ts'
import App from './App.tsx'
import './index.scss'

import '~common/styles/tailwind.css'

fileDbManager.open()

window.slate = slate
window.fileDbManager = fileDbManager

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
