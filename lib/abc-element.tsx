import { FC, useEffect, useRef } from 'react'
import { RenderElementProps } from 'slate-react'
import { type ABCTablatureElement } from '~chord'
import ABCJS from 'abcjs'

import './abc-element.scss'

export const ABCElement: FC<RenderElementProps> = ({ attributes, element, children }) => {
  const musicSheetRef = useRef(null)
  const { previewer } = element as ABCTablatureElement
  const abcNotation = element?.children?.[0].text

  useEffect(() => {
    if (musicSheetRef.current) {
      ABCJS.renderAbc(musicSheetRef.current, abcNotation)
    }
  }, [abcNotation])

  if (previewer) {
    return <div ref={musicSheetRef}></div>
  }
  return (
    <div className="abc-editor" spellCheck={false} {...attributes}>
      {children}
    </div>
  )
}
