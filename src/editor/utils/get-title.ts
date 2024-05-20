import { Element, Node } from 'slate'

// 获取标题的函数
export const getTitle = (value: Node[]): string => {
  for (const node of value) {
    if (Element.isElement(node)) {
      if (node.type === 'heading-1' || node.type === 'heading-2' || node.type === 'heading-3') {
        return Node.string(node)
      }
    }
  }

  // 如果没有找到 heading 节点，获取第一个非空文本节点
  for (const node of value) {
    const text = Node.string(node)
    if (text.trim() !== '') {
      return text
    }
  }

  return 'Untitled'
}
