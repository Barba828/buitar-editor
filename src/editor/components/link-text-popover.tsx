import { memo, useEffect, FC, useState, useCallback, ChangeEventHandler, useMemo } from 'react'
import { useSlate } from 'slate-react'
import {
  getSelectedLeavesFormat,
  getSelectedRect,
  Icon,
  isMarkActive,
  List,
  ListItem,
  ListItemProps,
  Popover,
  type CommonPopoverProps,
} from '~common'

import '~chord/components/input-chord-popover.scss'
import { Editor, Transforms } from 'slate'
import { CustomText } from '~/custom-types'

export const LinkTextPopover: FC<CommonPopoverProps> = memo(
  ({ visible = true, onVisibleChange }) => {
    const [text, setText] = useState<string>('')
    const [link, setLink] = useState<string>('')
    const [leaf, setLeaf] = useState<CustomText>()
    const editor = useSlate()
    const { selection } = editor
    const [rect, setRect] = useState<DOMRect | null>(null)

    const onInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
      setLink(e.target.value)
    }, [])
    const onInputTextChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
      setText(e.target.value)
    }, [])

    const saveLink = useCallback(() => {
      const chordText = {
        text: text.replace(/\n/g, '').trim(),
        link: link,
      }

      Transforms.insertNodes(editor, chordText)

      Editor.removeMark(editor, 'link')
      editor.insertText(' ')
      Transforms.move(editor)
    }, [editor, link, text])
    const removeLink = useCallback(() => {
      if (isMarkActive(editor, 'link')) {
        editor.removeMark('link')
        Transforms.move(editor)
        return
      }
    }, [editor])

    useEffect(() => {
      if (!selection) {
        return
      }
      const selectedRect = getSelectedRect(editor)
      if (!selectedRect || !visible) {
        return
      }
      setRect(selectedRect)

      const leaf = getSelectedLeavesFormat(editor, 'link')
      if (leaf?.[0]) {
        setLeaf(leaf[0])
      }
      setLink(leaf?.[0]?.link || '')
      setText(leaf?.[0]?.text || editor.string(selection))
    }, [editor, selection, visible])

    const lists = useMemo(
      () =>
        [
          link && {
            title: text,
            desc: link,
          },
          link && !link.startsWith('http') && { title: text, desc: `http://${link}` },
          link && !link.startsWith('https') && { title: text, desc: `https://${link}` },
        ].filter((item) => item && !!item.desc) as ListItemProps['item'][],
      [link, text]
    )

    if (!visible || !rect) {
      return null
    }

    return (
      <Popover
        data-cy="link-text-portal"
        rect={rect}
        className="input-container"
        onVisibleChange={onVisibleChange}
        onClose={() => setRect(null)}
      >
        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 m-1">Link title</div>
        <input placeholder="Input Text" onChange={onInputTextChange} defaultValue={text}></input>
        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 m-1">Url</div>
        <input
          placeholder="Input Link"
          onChange={onInputChange}
          defaultValue={link}
          autoFocus
        ></input>
        <List
          lists={lists}
          renderItem={(item) => <ListItem item={item}></ListItem>}
          onItemClick={saveLink}
        ></List>
        {leaf?.link && (
          <ListItem
            onClick={removeLink}
            className="h-8 rounded mt-1 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white transition-all duration-300"
            item={{ title: 'Reomve Link' }}
            left={<Icon name={'icon-remove'} className="m-1 mr-2" />}
          ></ListItem>
        )}
      </Popover>
    )
  }
)
