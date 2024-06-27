import { createContext, FC, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { CustomElement } from '~/custom-types'
import { Editor, Range } from 'slate'
import { useSlate } from 'slate-react'
import { debounce } from '~common/utils/debounce'
import { getClosetElement } from '~/editor/utils/get-closet-element'

interface EditableContextType {
  /**
   * 选中的元素的最浅深度（即在哪个层级选中），
   * 比如选中path[0, 1, 2]下的元素，则depth 为 3
   * 比如选中path[0, 3]下的元素，则depth 为 2
   */
  selectedDepth: number
  /**输入法正在输入 */
  imeComposing: boolean
  /**是否collapsed选中 */
  isCollapsedSelected: boolean
  /**鼠标移动方向向下 */
  isMouseDown: boolean
  /**最近的Block元素 */
  closestElement?: CustomElement
  mouseX: number
  mouseY: number

  onCompositionStart?: React.CompositionEventHandler<HTMLDivElement>
  onCompositionEnd?: React.CompositionEventHandler<HTMLDivElement>
  onMouseOver?: React.MouseEventHandler<HTMLDivElement>
  onSelect?: React.MouseEventHandler<HTMLDivElement>
}

const EditableContext = createContext<EditableContextType | undefined>(undefined)

export const EditableProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const editor = useSlate()
  const { selection } = editor
  const [imeComposing, setImeComposing] = useState<boolean>(false)
  const [isCollapsedSelected, setIsCollapsedSelected] = useState<boolean>(false)

  const [closestElement, setClosestElement] = useState<CustomElement>()
  const [isMouseDown, setIsMouseDown] = useState(true)
  const [mouseX, setMouseX] = useState(-1)
  const [mouseY, setMouseY] = useState(-1)

  const selectedDepth = useMemo(() => {
    if (!selection) {
      return 0
    }

    /**
     * 获取当前选择区域的深度，根据选区 focus, anchor 的重合path前缀获取
     */
    const { focus, anchor } = selection
    const _depth = focus.path.findIndex((n, index) => n !== anchor.path[index]) + 1

    /**
     * 1. path 完全一致，则取表示 selection 中仅行内offset不同，则深度为 focus.path.length - 1
     */
    if (_depth <= 0) {
      return focus.path.length - 1
    }

    const [parentAnchor, parentFocus] = Editor.edges(editor, focus.path.slice(0, _depth))
    const parentSelection = {
      anchor: parentAnchor,
      focus: parentFocus,
    }

    /**
     * 2. path 仅有一致前缀时，判断该前缀的父级 parentSelection 是否就是 selection ，若是则深度为 selectionDepth - 1
     */
    if (Range.equals(selection, parentSelection)) {
      return _depth - 1
    }

    return _depth
  }, [selection])

  const onCompositionStart = useCallback(() => {
    setImeComposing(true)
  }, [])

  const onCompositionEnd = useCallback(() => {
    setImeComposing(false)
  }, [])

  const onMouseOver: React.MouseEventHandler<HTMLDivElement> = useCallback(
    debounce((event) => {
      if (event.target) {
        const targetNode = getClosetElement(editor, event.target)?.[0] as CustomElement
        if (!targetNode || targetNode === closestElement) {
          return
        }
        setClosestElement(targetNode)
      }

      setIsMouseDown(event.clientY > mouseY)
      setMouseX(event.clientX)
      setMouseY(event.clientY)
    }, 16),
    [editor, mouseY, closestElement]
  )

  const onSelect = useCallback(
    debounce(() => {
      const { selection } = editor
      setIsCollapsedSelected(!!(selection && Range.isCollapsed(selection)))
    }, 100),
    [editor]
  )

  const value = {
    selectedDepth,
    closestElement,
    imeComposing,
    isCollapsedSelected,
    isMouseDown,
    mouseX,
    mouseY,

    onCompositionStart,
    onCompositionEnd,
    onMouseOver,
    onSelect,
  }
  return <EditableContext.Provider value={value}>{children}</EditableContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useEditableContext = () => {
  return useContext(EditableContext)
}
