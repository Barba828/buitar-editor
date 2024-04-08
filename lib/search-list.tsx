import { useState, useMemo, useCallback, useEffect, FC, memo } from 'react'
import { getChordListByStr, getTapsByChordName, strsToTaps } from './utils'
import { BoardChord, pitchToChordType } from '@buitar/to-guitar'
import { List } from './components/list'
import { TapsListItem } from './components/taps-item'
import { ChordNameItem } from './components/chord-name-item'

interface SearchListProps {
  search: string
  /**是否自定义输入Tap */
  isCustom?: boolean
  /**选择和弦名称callback */
  onSelectChord?: (chordName: string) => void
  /**选择指位callback */
  onSelectTaps?: (taps: BoardChord) => void
}

/**
 * 根据search文本获取和弦列表Element
 */
export const SearchList: FC<SearchListProps> = memo(
  ({ search, isCustom, onSelectChord, onSelectTaps }) => {
    const [selectedChord, setSelectedChord] = useState('')

    useEffect(() => {
      if (search !== selectedChord && selectedChord.length) {
        setSelectedChord('')
      }
    }, [search, selectedChord])

    /**根据 search => Chord Tags 列表 */
    const chordList = useMemo(() => {
      if (!search.length || isCustom) {
        return
      }
      return getChordListByStr(search)
    }, [isCustom, search])

    /**根据 selectedChord => Chord Taps 列表 */
    const chordTapList = useMemo(() => {
      if (!selectedChord.length || isCustom) {
        return
      }
      return getTapsByChordName(selectedChord)
    }, [isCustom, selectedChord])

    /**根据 search => 自定义 Chord Taps 列表 */
    const customChordTapList = useMemo(() => {
      if (!search.length || search.length > 6 || !isCustom) {
        return
      }

      const frets = search.slice(0, 6).split('')
      while (frets.length < 6) {
        frets.push('x')
      }

      const chordTaps = strsToTaps(frets)
      const chordTypes = pitchToChordType(Array.from(new Set(chordTaps.map((tap) => tap.tone))))

      // 无效和弦
      if (!chordTypes.length) {
        return [
          {
            chordTaps,
            chordType: {
              name: '--',
              name_zh: '--',
              tag: '',
            },
          },
        ]
      }

      // 同一taps 也许有转位和弦等多个名称
      return chordTypes.map(
        (chordType) =>
          ({
            chordTaps,
            chordType,
          } as BoardChord)
      )
    }, [isCustom, search])

    const onChordItemClick = useCallback(
      (chordName: string) => {
        onSelectChord?.(chordName)
        // 选择b/#升降号则返回继续选择tag，否则设置当前和弦有效名称
        if (
          chordName.length === 2 &&
          (chordName.endsWith('b') || chordName.endsWith('#')) &&
          chordName !== search
        ) {
          return
        }
        setSelectedChord(chordName)
      },
      [onSelectChord, search]
    )
    const onTapItemClick = useCallback(
      (taps: BoardChord) => {
        setSelectedChord('')
        onSelectTaps?.(taps)
      },
      [onSelectTaps]
    )

    if (isCustom) {
      return (
        customChordTapList?.length && (
          <List
            lists={customChordTapList}
            renderItem={(taps) => <TapsListItem taps={taps} size={120} />}
            onItemClick={onTapItemClick}
          ></List>
        )
      )
    } else if (chordTapList?.length) {
      return (
        <List
          lists={chordTapList}
          renderItem={(taps) => <TapsListItem taps={taps} />}
          onItemClick={onTapItemClick}
        ></List>
      )
    } else if (chordList?.length) {
      return (
        <List
          lists={chordList}
          onItemClick={onChordItemClick}
          renderItem={(chordName) => <ChordNameItem chordName={chordName} />}
        ></List>
      )
    }

    return null
  }
)
