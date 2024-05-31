import { type SvgChordPoint, SvgTablature } from '@buitar/svg-chord'
import { FC, HTMLProps, memo, useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactEditor,
  RenderElementProps,
  useFocused,
  useSelected,
  useSlateStatic,
} from 'slate-react'
import { CustomBlockTablatureElement } from '~chord'
import { ButtonGroup, getElementText, Icon, useIsLightMode } from '~common'
import { Transforms } from 'slate'
import cx from 'classnames'

import './tablature-element.scss'

const tranverseTablaturePoints = (text: string, stringNums: number = 6) => {
  const points: SvgChordPoint[] = []
  const stringTextArr = text.split('\n')
  stringTextArr.forEach((str, index) => {
    const taps = str.split(/[,\s]+/) // 使用逗号或空格进行分割
    const stringPoints = taps
      .filter((tap) => !!tap)
      .map((tap) => {
        const [fret, tone] = tap.split('-')
        return {
          fret: Number(fret) ? Number(fret) : -1,
          string: stringNums - index,
          tone: tone,
        } as SvgChordPoint
      })
    points.push(...stringPoints)
  })
  return points
}

const BLOCK_TABLATURE_MAX_SIZE = 10
const BLOCK_TABLATURE_MIN_SIZE = 0

export const TablatureElement: FC<RenderElementProps & HTMLProps<HTMLDivElement>> = memo(
  ({ attributes, element, children, ...divProps }) => {
    const {
      stringNums = 6,
      size = 5,
      horizontal = false,
      title,
      data: originText,
    } = element as CustomBlockTablatureElement
    const [editable, setEditable] = useState(false)
    const [text, setText] = useState(originText || '')
    const [points, setPoints] = useState<SvgChordPoint[]>([])
    const isLight = useIsLightMode()
    const editor = useSlateStatic()
    const focused = useFocused()
    const selected = useSelected()

    useEffect(() => {
      const points = tranverseTablaturePoints(text, stringNums)
      setPoints(points)
    }, [stringNums, text])

    const handleRotate = useCallback(() => {
      Transforms.setNodes(
        editor,
        { horizontal: !horizontal },
        { at: ReactEditor.findPath(editor, element) }
      )
    }, [editor, element, horizontal])

    const handleIncreaseSize = useCallback(() => {
      if (size >= BLOCK_TABLATURE_MAX_SIZE) return
      Transforms.setNodes(editor, { size: size + 1 }, { at: ReactEditor.findPath(editor, element) })
    }, [editor, element, size])

    const handleDecreaseSize = useCallback(() => {
      if (size <= BLOCK_TABLATURE_MIN_SIZE) return
      Transforms.setNodes(editor, { size: size - 1 }, { at: ReactEditor.findPath(editor, element) })
    }, [editor, element, size])

    const handleRemove = useCallback(() => {
      Transforms.removeNodes(editor, { at: ReactEditor.findPath(editor, element) })
    }, [editor, element])

    const btns = useMemo(
      () =>
        [
          title && { icon: <div className="inline-taps-item__tools-title">{title}</div> },
          {
            icon: !editable ? 'icon-edit-pencil' : 'icon-done',
            onClick: () => setEditable(!editable),
          },
          { icon: 'icon-rotate-cw', onClick: handleRotate },
          size > BLOCK_TABLATURE_MIN_SIZE && {
            icon: 'icon-remove-minus',
            onClick: handleDecreaseSize,
          },
          size < BLOCK_TABLATURE_MAX_SIZE && { icon: 'icon-add-plus', onClick: handleIncreaseSize },
          { icon: 'icon-close', onClick: handleRemove },
        ].filter((it) => !!it),
      [editable, handleDecreaseSize, handleIncreaseSize, handleRemove, handleRotate, size, title]
    )

    return (
      <div {...attributes} {...divProps}>
        {children}
        <div
          className={cx(
            'tablature-element',
            'flex-center',
            'tablature-element',
            { 'tablature-element--horizontal': horizontal },
            { 'tablature-element--editable': editable },
            { 'select-element': selected && !focused }
          )}
          spellCheck={false}
          contentEditable={editable}
          suppressContentEditableWarning
        >
          <ButtonGroup className="tablature-element__btns" btns={btns}></ButtonGroup>

          <div className="tablature-element__svg-wrapper">
            <SvgTablature
              className="tablature-element__svg"
              points={points}
              strings={stringNums}
              color={isLight ? '#444' : '#ccc'}
              fontColor={isLight ? '#eee' : '#222'}
              size={60 + size * 10}
              horizontal={horizontal}
              contentEditable={false}
            />
          </div>
          {editable && (
            <textarea
              className={cx(
                'tablature-element__content relative rounded-lg p-2 m-2 box-border text-sm border-none outline-none resize-y overflow-y-scroll w-full min-h-20'
              )}
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
              autoFocus
            ></textarea>
          )}
        </div>
      </div>
    )
  }
)
