import { createContext, FC, ReactNode, useCallback, useContext, useState } from 'react'
import { CustomElement } from '~/custom-types'
import { Range } from 'slate'
import { useSlate } from 'slate-react'
import { debounce } from '~common/utils/debounce'
import { getClosetElement } from '~/editor/utils/get-closet-element'

interface EditableContextType {
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
  const [imeComposing, setImeComposing] = useState<boolean>(false)
  const [isCollapsedSelected, setIsCollapsedSelected] = useState<boolean>(false)
  const [closestElement, setClosestElement] = useState<CustomElement>()

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
