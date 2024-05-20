import React from 'react'
import ReactDOM from 'react-dom/client'
import * as slate from 'slate'
import { dbManager} from '~/utils/indexed-files.ts'
import App from './App.tsx'
import './index.scss'

dbManager.open()

window.slate = slate
window.dbManager = dbManager

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
