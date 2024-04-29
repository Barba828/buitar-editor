import { ReactNode } from 'react'
import ReactDOM from 'react-dom'

export const Portal = ({ children, rootId }: { children?: ReactNode; rootId?: string }) => {
  if (typeof document !== 'object' || !children) {
    return null
  }
  // 默认渲染到body
  let root = document.body
  if (rootId) {
    const rootElement = document.getElementById(rootId)
    if (rootElement) {
      root = rootElement
    } else {
      const potalDiv = document.createElement('div')
      document.body.appendChild(potalDiv)
      root = potalDiv
    }
  }
  return ReactDOM.createPortal(children, root)
}
