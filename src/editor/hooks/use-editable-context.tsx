import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { CustomElement } from '~/custom-types'
import { Range } from 'slate'
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
  isCollapsedSelected: boolean
  /**最近的Block元素 */
  closestElement?: CustomElement

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

  const selectedDepth = useMemo(() => {
    if (!selection || Range.isCollapsed(selection)) {
      return 0
    }
    /**
     * 获取当前选择区域的深度，根据选区 focus, anchor 的重合path前缀获取，如果path一致，则取path.length - 1
     */
    const { focus, anchor } = selection
    const selectionDepth = focus.path.findIndex((n, index) => n !== anchor.path[index])
    return selectionDepth === -1 ? focus.path.length - 1 : selectionDepth + 1
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
    }, 16),
    [editor]
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
