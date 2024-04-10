import { useMemo } from 'react'
import { inputTags } from '~chord/config'
import { InlineChordPopover } from '~chord'

export const useInlineChordPopover = (search: string) => {
  /**当前输入是否是inlinePopover标记tag */
  const inlineChordTag = useMemo(() => {
    return inputTags.find((tag) => search.startsWith(tag)) && search.length > 2
  }, [search])

  if (inlineChordTag) {
    return <InlineChordPopover />
  }
  return null
}
