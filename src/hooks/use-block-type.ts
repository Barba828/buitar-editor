import { useEffect, useState } from 'react'
import { flatTypeArr, ToolType } from '../components/tools.config'
import { useSlateStatic } from 'slate-react'
import { Ancestor, NodeEntry, Element as SlateElement } from 'slate'
import { getSelectedNode } from '~common'

export const useBlockType = () => {
  const editor = useSlateStatic()
  const { selection } = editor
  const [blockType, setBlockType] = useState<ToolType>(flatTypeArr[0])
  const [node, setNode] = useState<NodeEntry<Ancestor>>()

  useEffect(() => {
    const selectedNode = getSelectedNode(editor)
    if (node === selectedNode) return
    if (selectedNode) {
      const block = selectedNode[0] as SlateElement
      const format = block?.type || 'paragraph'
      const blockType = flatTypeArr.find((item) => item.key === format)
      if (blockType) {
        setNode(selectedNode)
        setBlockType(blockType)
      }
    } else {
      setBlockType(flatTypeArr[0])
      setNode(undefined)
    }
  }, [selection]) // 仅观察「selection」

  return { selectType: blockType, selectNode: node }
}
