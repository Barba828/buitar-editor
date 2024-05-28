import { useEffect, useCallback, useState, FC, HTMLProps, MouseEventHandler, useMemo } from 'react'
import { Editor, Range } from 'slate'
import { useSlate } from 'slate-react'
import { InputChordPopover } from '~chord'
import { getSelectedRect, Icon, isBlockActive, isMarkActive, Popover } from '~common'
import { TextTypePopover } from '~/editor/components/text-type-popover'
import { LinkTextPopover } from '~/editor/components/link-text-popover'
import { useBlockType } from '~/editor/hooks/use-block-type'
import { ONLY_ONE_WRAP_TYPES } from '~/editor/plugins/config'
import cx from 'classnames'

import './select-toolbar.scss'

const defaultPopoverVisible = {
  textType: false,
  link: false,
  chord: false,
}

export const SelectToolbar = () => {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [visible, setVisible] = useState<boolean>(false)
  const [popoverVisibleMap, setPopoverVisibleMap] = useState(defaultPopoverVisible)
  const editor = useSlate()
  const { selection } = editor

  const { selectType } = useBlockType()

  /**判断是否显示toolbar */
  useEffect(() => {
    setVisible(
      Boolean(
        selection && !Range.isCollapsed(selection) && Editor.string(editor, selection).length > 0
      )
    )
    setPopoverVisibleMap(defaultPopoverVisible)
  }, [editor, selection])

  /**显示toolbar位置 */
  useEffect(() => {
    if (!visible) {
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
            <FormatButton format="code">
              <strong style={{ fontSize: '0.8rem' }}>{`</>`}</strong>
            </FormatButton>
          )}
        </div>
        {!isBasicToolbar && (
          <div className="toolbar-menu-group">
            <FormatButton format="link" onMouseDown={() => handlePopoverVisibleChange('link')}>
              <Icon name="icon-link-break" />
              <Icon name="icon-right" className="toolbar-menu-item__right" />
            </FormatButton>
            <FormatButton format="chord" onMouseDown={() => handlePopoverVisibleChange('chord')}>
              <Icon name="icon-chord" />
              <Icon name="icon-right" className="toolbar-menu-item__right" />
            </FormatButton>
          </div>
        )}
      </Popover>

      <TextTypePopover visible={popoverVisibleMap['textType']} />
      <LinkTextPopover visible={popoverVisibleMap['link']}></LinkTextPopover>
      <InputChordPopover visible={popoverVisibleMap['chord']} />
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
      className={cx('toolbar-menu-item', active && 'toolbar-menu-item--active')}
      onMouseDown={props.onMouseDown ? props.onMouseDown : onMouseDown}
      {...props}
    >
      {children}
    </div>
  )
}
