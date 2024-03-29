import type { ChordType, Point, Tone } from '@buitar/to-guitar'
import { rootToChord, transChordTaps, Board, chordTagMap } from '@buitar/to-guitar'

const _board = new Board()
const tags = Array.from(chordTagMap.keys())

/**
 * 根据pitch获取note
 * @param pitch
 */
export const getNoteByPitch = (pitch: number) => {
  return _board.notes[pitch % 12]
}

/**
 * 根据str获取note和tag
 * @param str
 */
export const getNoteAndTag = (str: string) => {
  if (!str.length) {
    throw Error('chord name is empty')
  }
  let note = str[0].toLocaleUpperCase(),
    tag = str.slice(1)

  if (['b', '#'].includes(str[1])) {
    note = str[0] + str[1]
    tag = str.slice(2)
  }

  return {
    note,
    tag,
  }
}

/**
 * 根据搜索文本获取推荐和弦名称（note + tag）列表
 * @param search
 * @returns
 */
export const getChordListByStr = (search: string) => {
  if (!search) {
    return []
  }
  if (!['C', 'D', 'E', 'F', 'G', 'A', 'B'].includes(search[0].toLocaleUpperCase())) {
    return []
  }

  const { note, tag } = getNoteAndTag(search)
  if (search.length === 1) {
    return ['', 'b', '#', ...tags.slice(1)].map((t) => note + t)
  }
  return tags.filter((t) => t.includes(tag)).map((t) => note + t)
}

/**
 * 根据和弦名称获取taps列表
 * @param chordName
 * @returns
 */
export const getTapsByChordName = (chordName: string) => {
  if (!chordName.length) {
    return []
  }
  const { note, tag } = getNoteAndTag(chordName)
  const { chord } = rootToChord(note as Tone, tag)
  if (!chord) {
    return []
  }
  const chordTones = chord.map((pitch) => _board.notes[pitch % 12] as Tone)
  return transChordTaps(chordTones, _board)
}

export const getChordName = (chordType: ChordType): string => {
  if (chordType.tone === undefined) {
    return ''
  }
  if (chordType.tone === chordType.over) {
    return `${getNoteByPitch(chordType.tone)}${chordType.tag}`
  } else {
    return `${getNoteByPitch(chordType.over || 0)}${chordType.tag}/${getNoteByPitch(
      chordType.tone || 0
    )}`
  }
}

/**
 * 根据strs获取SvgChord的points
 * @param strs
 */
export const strsToTaps = (strs: string[]) => {
  return strs
    .map((str, index) => {
      const grade = Number(str) // 获取该弦的品数
      if (isNaN(grade)) {
        return null
      } else {
        return _board.keyboard[index][grade]
      }
    })
    .filter((it) => !!it) as Point[]
}

/**string 单词首字母大写 */
export const capitalizeEveryWord = (sentence: string) => {
  return sentence.replace(/\b\w/g, function (char) {
    return char.toUpperCase()
  })
}
