import type { Point, Tone } from '@buitar/to-guitar'
import type { SvgChordPoint } from '@buitar/svg-chord'
import { rootToChord, transChordTaps, Board } from '@buitar/to-guitar'

const _board = new Board()

export const getNoteByPitch = (pitch: number) => {
  return _board.notes[pitch % 12]
}

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

/**
 * ToGuitar.Point => SvgChord.Point
 * @param point
 * @returns
 */
export const transToSvgPoint = (point: Point): SvgChordPoint => {
  return {
    fret: point.grade,
    string: point.string,
    tone: point.note,
  }
}

/**
 * ToGuitar.Point[] => SvgChord.Point[]
 * @param points
 * @param stringNums 弦数
 * @returns
 */
export const transToSvgPoints = (
  points: Point[],
  stringNums: number = 6
): SvgChordPoint[] => {
  const svgPoints = points.map(transToSvgPoint)
  return makeUpGuitarPoints(svgPoints, stringNums)
}

/**
 * 补全String数
 */
export const makeUpGuitarPoints = (
  points: SvgChordPoint[],
  num: number
): SvgChordPoint[] => {
  return new Array(num).fill(0).map((_, index) => {
    const idx = points.findIndex((point) => point.string === index + 1)
    if (idx === -1) {
      return {
        fret: -1,
        string: index + 1,
      }
    } else {
      return points[idx]
    }
  })
}
