import {
  FC,
  FormEventHandler,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Transforms } from 'slate'
import { ReactEditor, RenderElementProps, useSlateStatic } from 'slate-react'
import { type ABCTablatureElement } from '~chord'
import ABCJS, { type TablatureInstrument } from 'abcjs'
import { getElementText, Icon, Selector, toast } from '~common'
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
      const tablature = instrument ? [{ instrument }] : []
      ABCJS.renderAbc(musicSheetRef.current, abcNotation, {
        add_classes: true,
        oneSvgPerLine: true,
        responsive: 'resize',
        selectTypes: false,
        tablature: tablature,
      })
    }
  }, [abcNotation, instrument])

  useEffect(() => {
    setShort(!editable)
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

  useEffect(() => {
    /**初始空数据则设置为可编辑 */
    if (!abcNotation.length) {
      setEditable(true)
    }
  }, [])

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
      toast('复制成功')
    })
  }, [abcNotation])

  const showSetShortBtn = useMemo(
    () =>
      !editable &&
      !fullscreen &&
      musicSheetRef.current?.scrollHeight &&
      musicSheetRef.current.scrollHeight > 200,
    [fullscreen, editable]
  )

  return (
    <div
      className={cx(
        'abc-editor',
        { 'abc-editor--fullscreen': fullscreen },
        { 'abc-editor--short': short }
      )}
      {...attributes}
      spellCheck={false}
      data-slate-tablature={instrument}
      contentEditable={editable}
      suppressContentEditableWarning
    >
      <div className="abc-editor__btns" contentEditable={false}>
        <div className="abc-editor__trigger flex-center" onClick={handleCopy}>
          <Icon name="icon-copy"></Icon>
        </div>
        <div className="abc-editor__trigger flex-center" onClick={handlePrint}>
          <Icon name="icon-print"></Icon>
        </div>
        <div className="abc-editor__trigger flex-center" onClick={() => setEditable(!editable)}>
          <Icon name={!editable ? 'icon-edit-pencil' : 'icon-done'}></Icon>
        </div>
        <div className="abc-editor__trigger flex-center" onClick={() => setFullscreen(!fullscreen)}>
          <Icon name={fullscreen ? 'icon-shrink' : 'icon-expand'}></Icon>
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
        {showSetShortBtn && (
          <div
            className="abc-editor__trigger flex-center"
            onClick={() => setShort(!short)}
          >
            <Icon name='icon-trigger' style={{transform: `rotate(${short ? 0 : 180}deg)`}}></Icon>
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
