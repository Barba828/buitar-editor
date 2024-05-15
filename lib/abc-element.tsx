import { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Transforms } from 'slate'
import { ReactEditor, RenderElementProps, useSlateStatic } from 'slate-react'
import { type ABCTablatureElement } from '~chord'
import abcjs, { type TablatureInstrument } from 'abcjs'
import { ButtonGroup, getElementText, Icon, Selector, type SelectorItem, toast } from '~common'
import cx from 'classnames'

import './abc-element.scss'

// const isABCTablatureElement = (element: SlateElement): element is ABCTablatureElement => {
//   return element.type === 'abc-tablature'
// }

const instruments: Array<SelectorItem<TablatureInstrument>> = [
  { value: '', label: '--' },
  { value: 'guitar', label: 'guitar' },
  { value: 'violin', label: 'violin' },
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
    if (!musicSheetRef.current || !abcjs) {
      return
    }
    const tablature = instrument ? [{ instrument }] : []
    abcjs.renderAbc(musicSheetRef.current, abcNotation, {
      add_classes: true,
      oneSvgPerLine: true,
      responsive: 'resize',
      selectTypes: false,
      tablature: tablature,
    })
    // })
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

  const handleABCIntrumentChange = useCallback(
    (item: SelectorItem<TablatureInstrument>) => {
      const nextInstrument = item.value
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
      toast('Cupied Text')
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

  const mainBtns = useMemo(
    () => [
      { icon: 'icon-copy', onClick: handleCopy },
      { icon: 'icon-print', onClick: handlePrint },
      { icon: !editable ? 'icon-edit-pencil' : 'icon-done', onClick: () => setEditable(!editable) },
      {
        icon: fullscreen ? 'icon-shrink' : 'icon-expand',
        onClick: () => setFullscreen(!fullscreen),
      },
    ],
    [editable, fullscreen, handleCopy, handlePrint]
  )

  const footerBtns = useMemo(
    () =>
      [
        showSetShortBtn && {
          icon: (
            <Icon name="icon-trigger" style={{ transform: `rotate(${short ? 0 : 180}deg)` }}></Icon>
          ),
          onClick: () => setShort(!short),
        },
      ].filter((it) => !!it),
    [short, showSetShortBtn]
  )

  const leftBtns = useMemo(
    () => [
      {
        icon: (
          <Selector
            className={cx(
              'abc-editor__trigger',
              !instrument && 'abc-editor__trigger--no-instrument'
            )}
            lists={instruments}
            onChange={handleABCIntrumentChange}
          ></Selector>
        ),
      },
    ],
    [handleABCIntrumentChange, instrument]
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
      <ButtonGroup className="abc-editor__btns" btns={mainBtns}></ButtonGroup>

      <ButtonGroup className="abc-editor__btns abc-editor__left-btns" btns={leftBtns}></ButtonGroup>

      <ButtonGroup
        className="abc-editor__btns abc-editor__footer-btns"
        btns={footerBtns}
      ></ButtonGroup>

      <div className="abc-editor__content" style={{ display: editable ? 'block' : 'none' }}>
        {children}
      </div>

      <div contentEditable={false} className="abc-editor__previewer">
        <div ref={musicSheetRef}></div>
      </div>
    </div>
  )
})

export default ABCElement
