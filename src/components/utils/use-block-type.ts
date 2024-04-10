import { useEffect, useState } from 'react'
import { chordTypeMenu, textTypeMenu, ToolType } from '../tools.config'
import { useSlateStatic } from 'slate-react'
import { getSelectedBlockType } from '~chord'

const flatTypeArr = [...textTypeMenu, ...chordTypeMenu]

export const useBlockType = () => {
  const editor = useSlateStatic()
  const { selection } = editor
  const [blockType, setBlockType] = useState<ToolType>(flatTypeArr[0])

  useEffect(() => {
    const format = getSelectedBlockType(editor)
    const blockType = flatTypeArr.find((item) => item.key === format)
    if (blockType) {
      setBlockType(blockType)
    }
  }, [editor, selection])

  return blockType
}
