import { FC, HTMLProps, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Transforms } from 'slate'
import {
  ReactEditor,
  RenderElementProps,
  useFocused,
  useSelected,
  useSlateStatic,
} from 'slate-react'
import { type ABCTablatureElement } from '~chord'
import abcjs, { type TablatureInstrument } from 'abcjs'
import { ButtonGroup, Icon, Selector, type SelectorItem, toast } from '~common'
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

export const ABCElement: FC<RenderElementProps & HTMLProps<HTMLDivElement>> = memo(
  ({ attributes, element, children, ...divProps }) => {
    const musicSheetRef = useRef<HTMLDivElement>(null)
    const editor = useSlateStatic()
    const selected = useSelected()
    const focused = useFocused()
    const { instrument, data: originText } = element as ABCTablatureElement
    const [fullscreen, setFullscreen] = useState(false)
    const [editable, setEditable] = useState(false)
    const [short, setShort] = useState(true)
    const [text, setText] = useState(originText || '')

    useEffect(() => {
      if (!musicSheetRef.current || !abcjs) {
        return
      }
      const tablature = instrument ? [{ instrument }] : []
      abcjs.renderAbc(musicSheetRef.current, text, {
        add_classes: true,
        oneSvgPerLine: true,
        responsive: 'resize',
        selectTypes: false,
        tablature: tablature,
      })
      // })
    }, [text, instrument])

    useEffect(() => {
      setShort(!editable)
    }, [editable])
    useEffect(() => {
      setShort(!fullscreen)
    }, [fullscreen])
    useEffect(() => {
      if (short) {
        setEditable(false)
        setFullscreen(false)
      }
    }, [short])

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
      navigator.clipboard.writeText(text).then(() => {
        toast('Cupied Text')
      })
    }, [text])

    const handleRemove = useCallback(() => {
      Transforms.removeNodes(editor, { at: ReactEditor.findPath(editor, element) })
    }, [editor, element])

    const handleEdit = useCallback(() => {
      if (editable) {
        Transforms.setNodes(editor, { data: text }, { at: ReactEditor.findPath(editor, element) })
      }
      setEditable(!editable)
    }, [editable, editor, element, text])

    const showSetShortBtn = useMemo(
      () =>
        !editable &&
        !fullscreen &&
        musicSheetRef.current?.scrollHeight &&
        musicSheetRef.current.scrollHeight > 200,
      [fullscreen, editable, text]
    )

    const mainBtns = useMemo(
      () =>
        [
          { icon: 'icon-copy', onClick: handleCopy },
          { icon: 'icon-print', onClick: handlePrint },
          {
            icon: !editable ? 'icon-edit-pencil' : 'icon-done',
            onClick: handleEdit,
          },
          {
            icon: fullscreen ? 'icon-shrink' : 'icon-expand',
            onClick: () => setFullscreen(!fullscreen),
          },
          !fullscreen && { icon: 'icon-remove', onClick: handleRemove },
        ].filter((it) => !!it),
      [editable, fullscreen, handleCopy, handlePrint, handleRemove]
    )

    const footerBtns = useMemo(
      () =>
        [
          showSetShortBtn && {
            icon: (
              <Icon
                name="icon-trigger"
                style={{ transform: `rotate(${short ? 0 : 180}deg)` }}
              ></Icon>
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
                'abc-editor__trigger bg-transparent',
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
      <div {...attributes} {...divProps} data-slate-tablature={instrument}>
        {children}
        <div
          className={cx(
            'abc-editor rounded-lg group  box-border text-sm',
            { 'relative my-4 p-4': !fullscreen },
            {
              'abc-editor--fullscreen fixed m-0 p-0 rounded-none top-0 left-0 flex flex-row':
                fullscreen,
            },
            { 'abc-editor--short': short },
            {
              'select-element after:rounded-lg':
                selected && focused && !editable && !fullscreen && short,
            }
          )}
          contentEditable={false}
        >
          <ButtonGroup
            className="abc-editor__btns absolute top-2 right-2 opacity-0 group-hover:opacity-100"
            btns={mainBtns}
          ></ButtonGroup>
          <ButtonGroup
            className="abc-editor__btns absolute top-2 left-2 opacity-0 group-hover:opacity-100"
            btns={leftBtns}
          ></ButtonGroup>
          <ButtonGroup
            className="abc-editor__btns absolute bottom-2 right-2 opacity-0 group-hover:opacity-100"
            btns={footerBtns}
          ></ButtonGroup>

          {editable && (
            <textarea
              className={cx(
                'abc-editor__content rounded-lg p-2 pt-6 box-border border-none outline-none resize-y overflow-y-scroll w-full min-h-32'
              )}
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
              autoFocus
            ></textarea>
          )}

          {!text && !editable && (
            <div
              onClick={() => setEditable(true)}
              className="relative z-10 h-10 flex items-center justify-start pl-2 cursor-pointer"
            >
              <Icon name="icon-list-music" className="opacity-50 text-xl mr-2"></Icon>
              <div className="font-bold opacity-50 text-sm">Edit an abc music</div>
            </div>
          )}
          <div className="abc-editor__previewer" style={!text && !editable ? { height: 0 } : {}}>
            <div ref={musicSheetRef}></div>
          </div>
        </div>
      </div>
    )
  }
)

export default ABCElement
