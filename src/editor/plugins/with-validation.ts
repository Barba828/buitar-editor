import { Editor } from 'slate'

export const withValidation = (editor: Editor) => {
//   const { normalizeNode } = editor

  //   editor.normalizeNode = ([node, path]) => {
  //     const validChange = !!validateNode(editor, [node, path]) // 应用自定义验证逻辑
  //     if(validChange){
  //       return
  //     }
  //     // normalizeNode([node, path])
  //   }

  return editor
}

// function validateNode(editor: Editor, entry: NodeEntry) {
//   const [node, path] = entry

//   if (Element.isElement(node)) {
//     if (NONE_RICH_WRAP_TYPES.includes(node.type)) {
//       const invalidChildren = node.children?.filter(
//         (child) => !(Element.isElement(child) && child.type === 'paragraph')
//       )
//       console.log('lnz validateNode', invalidChildren)

//       if (invalidChildren && invalidChildren.length > 0) {
//         invalidChildren.forEach((child, index) => {
//           if (!Element.isElement(child) || child.type !== 'paragraph') {
//             // 转换非法节点的文本内容为 paragraph
//             const newChild = {
//               type: 'paragraph',
//               children: Text.isText(child)
//                 ? [{ text: child.text }]
//                 : [{ text: 'Replaced content' }], // 转移文本内容
//             }
//             console.log('lnz newChild', newChild)
//             console.log('lnz newChild Path', path, [...path, index])

//             // 使用 Transforms.setNodes 来替换节点类型
//             Transforms.setNodes(editor, newChild, { at: [...path] })
//           }
//         })
//         return true
//       }
//     }
//   }
// }
