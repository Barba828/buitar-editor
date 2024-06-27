import { useEffect, useCallback, useState, FC, HTMLProps, MouseEventHandler, useMemo } from 'react'
import { Editor, Range } from 'slate'
import { useFocused, useSlate } from 'slate-react'
import { InputChordPopover } from '~chord'
import { getSelectedRect, Icon, isBlockActive, isMarkActive, Popover } from '~common'
import { TextTypePopover } from '~/editor/components/text-type-popover'
import { LinkTextPopover } from '~/editor/components/link-text-popover'
import { TextColorPopover } from '~/editor/components/text-color-popover'
import { useBlockType } from '~/editor/hooks/use-block-type'
import { ONLY_ONE_WRAP_TYPES } from '~/editor/plugins/config'
import cx from 'classnames'

import './select-toolbar.scss'

const defaultPopoverVisible = {
  textType: false,
  link: false,
  chord: false,
  color: false,
}

export const SelectToolbar = () => {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [visible, setVisible] = useState<boolean>(false)
  const [popoverVisibleMap, setPopoverVisibleMap] = useState(defaultPopoverVisible)
  const editor = useSlate()
  const focused = useFocused()
  const { selection } = editor
  const colorStyle = Editor.marks(editor)?.color

  const { selectType } = useBlockType()

  /**判断是否显示toolbar */
  useEffect(() => {
    const nextVisible = Boolean(
      selection && !Range.isCollapsed(selection) && Editor.string(editor, selection).length > 0
    )
    setVisible(nextVisible)
    if (!nextVisible) {
      setPopoverVisibleMap(defaultPopoverVisible)
    }
  }, [editor, selection])

  /**显示toolbar位置 */
  useEffect(() => {
    if (!visible || !focused) {
      return
    }

    const selectedRect = getSelectedRect(editor)
    if (!selectedRect) {
      return
    }
    setRect(selectedRect)
  }, [editor, visible, selection])

  const handlePopoverVisibleChange = useCallback(
    (key: keyof typeof defaultPopoverVisible) => {
      const map = { ...defaultPopoverVisible, [key]: !popoverVisibleMap[key] }
      setPopoverVisibleMap(map)
    },
    [popoverVisibleMap]
  )

  /**当前展示是否是基本文本Tool */
  const isBasicToolbar = useMemo(() => {
    return isBlockActive(editor, ONLY_ONE_WRAP_TYPES)
  }, [editor, selection])

  const cleanFormat = useCallback(() => {
    editor.toggleBlock?.({ type: selectType.key as BlockFormat }, { toActive: false })
  }, [editor, selectType])

  if (!visible || !rect) {
    return null
  }

  return (
    <>
      <Popover
        className="select-toolbar"
        onVisibleChange={setVisible}
        rect={rect}
        option={{ placement: 'top' }}
      >
        <div className="toolbar-menu-group">
          <div
            className="toolbar-menu-item"
            onMouseDown={() => handlePopoverVisibleChange('textType')}
          >
            {selectType.title}
          </div>
          {selectType.key !== 'paragraph' && (
            <div className="toolbar-menu-item">
              <Icon name="icon-clean-up" onClick={cleanFormat} />
            </div>
          )}
        </div>
        <div className="toolbar-menu-group">
          <FormatButton format="bold">
            <strong>B</strong>
          </FormatButton>
          <FormatButton format="italic">
            <em>I</em>
          </FormatButton>
          <FormatButton format="underlined">
            <u>U</u>
          </FormatButton>
          <FormatButton format="strike">
            <s>S</s>
          </FormatButton>
          {!isBasicToolbar && (
            <>
              <FormatButton format="code">
                <strong style={{ fontSize: '0.8rem' }}>{`</>`}</strong>
              </FormatButton>
              <div
                onMouseDown={() => handlePopoverVisibleChange('color')}
                className="toolbar-menu-item"
              >
                <div
                  className={cx(
                    'w-5 h-5 flex-center text-sm rounded-sm',
                    colorStyle?.color,
                    colorStyle?.background,
                    colorStyle?.background && 'bg-opacity-40'
                  )}
                >
                  A
                </div>
                <Icon
                  name="icon-right"
                  className={cx(
                    'ml-1 opacity-60 rotate-90 text-xs transition-all duration-300',
                    popoverVisibleMap['color'] && '-rotate-90'
                  )}
                />
              </div>
            </>
          )}
        </div>
        <div className="toolbar-menu-group">
          {!isBasicToolbar && (
            <>
              <FormatButton format="link" onMouseDown={() => handlePopoverVisibleChange('link')}>
                <Icon name="icon-link-break" />
                <Icon
                  name="icon-right"
                  className={cx(
                    'ml-1 opacity-60 rotate-90 text-xs transition-all duration-300',
                    popoverVisibleMap['link'] && '-rotate-90'
                  )}
                />
              </FormatButton>
              <FormatButton format="chord" onMouseDown={() => handlePopoverVisibleChange('chord')}>
                <Icon name="icon-chord" />
                <Icon
                  name="icon-right"
                  className={cx(
                    'ml-1 opacity-60 rotate-90 text-xs transition-all duration-300',
                    popoverVisibleMap['chord'] && '-rotate-90'
                  )}
                />
              </FormatButton>
            </>
          )}
        </div>
      </Popover>

      <TextTypePopover visible={popoverVisibleMap['textType']} />
      <LinkTextPopover visible={popoverVisibleMap['link']} />
      <InputChordPopover visible={popoverVisibleMap['chord']} />
      <TextColorPopover visible={popoverVisibleMap['color']} />
    </>
  )
}

const FormatButton: FC<{ format: TextFormat } & HTMLProps<HTMLDivElement>> = ({
  format,
  children,
  ...props
}) => {
  const editor = useSlate()
  const active = isMarkActive(editor, format)
  const onMouseDown: MouseEventHandler<HTMLDivElement> = useCallback((e) => {
    e.preventDefault()
    editor.toggleMark?.(format)
  }, [])
  return (
    <div
      {...props}
      className={cx('toolbar-menu-item', active && 'toolbar-menu-item--active', props.className)}
      onMouseDown={props.onMouseDown ? props.onMouseDown : onMouseDown}
    >
      {children}
    </div>
  )
}
