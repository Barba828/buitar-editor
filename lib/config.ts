/**
 * c - chord 自选inline和弦
 * x - custom 自定义inline和弦
 * t - tap 自选fixed和弦
 * r - rest 自定义fixed和弦
 * Uppercase - 详情和弦卡片
 */
export type ChordInputTag = '' | '/c' | '/C' | '/x' | '/X' | '/t' | '/T' | '/r' | '/R'
export const inputTags: ChordInputTag[] = ['/c', '/C', '/x', '/X', '/t', '/T', '/r', '/R']

export const slashChordMenu = [
  {
    type: 'chord',
    key: '/CA',
    title: 'Inline Chord',
    desc: 'Insert Inline Chord',
  },
  {
    type: 'chord',
    key: '/X00',
    title: 'Inline Custom Chord',
    desc: 'Insert Inline Custom Chord',
  },
  {
    type: 'chord',
    key: '/TA',
    title: 'Fixed Chord',
    desc: 'Insert Fixed Chord',
  },
  {
    type: 'chord',
    key: '/Rx00',
    title: 'Fixed Custom Chord',
    desc: 'Insert Fixed Custom Chord',
  },
]
