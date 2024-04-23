import { FC, FormEventHandler, memo, useCallback, useEffect, useRef, useState } from 'react'
import { Transforms } from 'slate'
import { ReactEditor, RenderElementProps, useSlateStatic } from 'slate-react'
import { type ABCTablatureElement, Selector } from '~chord'
import ABCJS, { type TablatureInstrument } from 'abcjs'
import { getElementText } from '~common'
import cx from 'classnames'

import './abc-element.scss'

// const isABCTablatureElement = (element: SlateElement): element is ABCTablatureElement => {
//   return element.type === 'abc-tablature'
// }

const instruments: Array<{ key: TablatureInstrument; value?: string }> = [
  { key: '', value: '--' },
  { key: 'guitar' },
  { key: 'violin' },
]

export const ABCElement: FC<RenderElementProps> = memo(({ attributes, element, children }) => {
  const musicSheetRef = useRef<HTMLDivElement>(null)
  const editor = useSlateStatic()
  const { instrument } = element as ABCTablatureElement
  const abcNotation = getElementText(element)
  const [fullscreen, setFullscreen] = useState(false)
  const [editable, setEditable] = useState(false)
  const [short, setShort] = useState(true)

  useEffect(() => {
    if (musicSheetRef.current) {
      ABCJS.renderAbc(musicSheetRef.current, abcNotation, {
        add_classes: true,
        oneSvgPerLine: true,
        responsive: 'resize',
        selectTypes: false,
        tablature: [instrument ? { instrument } : null].filter((item) => !!item),
      })
    }
  }, [abcNotation, instrument])

  useEffect(() => {
    if (editable) {
      setShort(false)
    }
  }, [editable])
  useEffect(() => {
    if (fullscreen) {
      setShort(false)
    }
  }, [fullscreen])
  useEffect(() => {
    if (short) {
      setEditable(false)
      setFullscreen(false)
    }
  }, [short])

  const handleABCIntrumentChange: FormEventHandler<HTMLSelectElement> = useCallback(
    (event) => {
      const nextInstrument = (event.target as HTMLSelectElement).value as TablatureInstrument
      Transforms.setNodes(
        editor,
        { instrument: nextInstrument },
        { at: ReactEditor.findPath(editor, element) }
      )
    },
    [editor, element]
  )

  const handlePrint = useCallback(() => {
    // window.print()
    const printWindow = window.open('', '_blank')
    if (!printWindow || !musicSheetRef.current) {
      return
    }
    printWindow.document.write(
      `<html><head><title> buitar editor </title></head><body>
        ${musicSheetRef.current.innerHTML}
      </body></html>`
    )
    printWindow.document.close()
    printWindow.print()
  }, [])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(abcNotation).then(() => {
      /**
       * @TODO toast
       */
    })
  }, [abcNotation])

  return (
    <div
      className={cx(
        'abc-editor',
        { 'abc-editor--fullscreen': fullscreen },
        { 'abc-editor--short': short }
      )}
      spellCheck={false}
      data-slate-tablature={instrument}
      {...attributes}
    >
      <div className="abc-editor__btns" contentEditable={false}>
        <div className="abc-editor__trigger" onClick={handleCopy}>
          Copy
        </div>
        <div className="abc-editor__trigger" onClick={handlePrint}>
          Print
        </div>
        <div className="abc-editor__trigger" onClick={() => setEditable(!editable)}>
          {!editable ? 'Edit' : 'Preview'}
        </div>
        <div className="abc-editor__trigger" onClick={() => setFullscreen(!fullscreen)}>
          {fullscreen ? 'X' : '⬌'}
        </div>
      </div>

      <div className="abc-editor__btns abc-editor__left-btns" contentEditable={false}>
        <Selector
          className={cx('abc-editor__trigger', !instrument && 'abc-editor__trigger--no-instrument')}
          lists={instruments}
          onChange={handleABCIntrumentChange}
        ></Selector>
      </div>

      <div className="abc-editor__btns abc-editor__footer-btns" contentEditable={false}>
        {!fullscreen && (
          <div className="abc-editor__trigger" onClick={() => setShort(!short)}>
            {short ? '⬌' : 'X'}
          </div>
        )}
      </div>

      <div className="abc-editor__content" style={{ display: editable ? 'block' : 'none' }}>
        {children}
      </div>

      <div contentEditable={false} className="abc-editor__previewer">
        <div ref={musicSheetRef}></div>
      </div>
    </div>
  )
})
