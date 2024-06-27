import { memo, useEffect, FC, useState, useCallback } from 'react'
import { useSlate } from 'slate-react'
import { getSelectedLeavesFormat, getSelectedRect, Popover, type CommonPopoverProps } from '~common'
import { Editor } from 'slate'
import { CustomText } from '~/custom-types'
import cx from 'classnames'

import '~chord/components/input-chord-popover.scss'

const textColors = [
  'text',
  'text-gray-600',
  'text-red-600',
  'text-orange-600',
  'text-amber-600',
  'text-yellow-600',
  'text-lime-600',
  'text-green-600',
  'text-teal-600',
  'text-cyan-600',
  'text-sky-600',
  'text-blue-600',
  'text-purple-600',
  'text-fuchsia-600',
  'text-pink-600',
  'text-rose-600',
]

const bgColors = [
  'text',
  'bg-gray-200',
  'bg-red-200',
  'bg-orange-200',
  'bg-amber-200',
  'bg-yellow-200',
  'bg-lime-200',
  'bg-green-200',
  'bg-teal-200',
  'bg-cyan-200',
  'bg-sky-200',
  'bg-blue-200',
  'bg-purple-200',
  'bg-fuchsia-200',
  'bg-pink-200',
  'bg-rose-200',
]

export const TextColorPopover: FC<CommonPopoverProps> = memo(
  ({ visible = true, onVisibleChange }) => {
    const [fontColor, setFontColor] = useState<string>('')
    const [bgColor, setBgColor] = useState<string>('')
    const editor = useSlate()
    const { selection } = editor
    const [rect, setRect] = useState<DOMRect | null>(null)

    useEffect(() => {
      if (!selection) {
        return
      }
      const selectedRect = getSelectedRect(editor)
      if (!selectedRect || !visible) {
        return
      }
      setRect(selectedRect)

      const leaf = getSelectedLeavesFormat(editor, 'color')
      setFontColor(leaf?.[0]?.color?.color || '')
      setBgColor(leaf?.[0]?.color?.background || '')
    }, [visible])

    const handleSetColor = useCallback(
      (colorObj: CustomText['color'] = {}) => {
        const { color, background } = colorObj
        color && setFontColor(color)
        background && setBgColor(background)

        Editor.addMark(editor, 'color', { color: fontColor, background: bgColor, ...colorObj })
      },
      [editor, fontColor, bgColor]
    )

    if (!visible || !rect) {
      return null
    }

    return (
      <Popover
        data-cy="link-text-portal"
        rect={rect}
        onVisibleChange={onVisibleChange}
        onClose={() => setRect(null)}
        className="pb-4 w-56 select-none"
      >
        <div className="font-bold text-sm mb-2 opacity-60">Font Color</div>
        <div className="flex justify-start gap-2 flex-wrap">
          {textColors.map((color) => (
            <div
              onClick={() => handleSetColor({ color: color })}
              className={cx(
                color,
                'box-border rounded w-5 h-5 flex-center cursor-pointer hover:border hover:border-solid border-gray-300 border-opacity-60',
                fontColor === color && 'border-1.5 border-solid border-blue-300'
              )}
              key={color}
            >
              A
            </div>
          ))}
        </div>

        <div className="font-bold text-sm mt-2 mb-2 opacity-60">Background Color</div>
        <div className="flex justify-start gap-2 flex-wrap">
          {bgColors.map((color) => (
            <div
              onClick={() => handleSetColor({ background: color })}
              className={cx(
                color,
                'box-border rounded w-5 h-5 flex-center cursor-pointer hover:border-1.5 hover:border-solid border-gray-300 bg-opacity-40 border-opacity-60',
                bgColor === color && 'border-1.5 border-solid border-blue-300'
              )}
              key={color}
            >
              A
            </div>
          ))}
        </div>
      </Popover>
    )
  }
)
