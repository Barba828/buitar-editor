/**
 * c - chord 自选inline和弦
 * x - custom 自定义inline和弦
 * t - tap 自选fixed和弦
 * r - rest 自定义fixed和弦
 * Uppercase - 详情和弦卡片
 */
export type ChordInputTag = '' | '/c' | '/C' | '/x' | '/X' | '/t' | '/T' | '/r' | '/R'
export const inputTags: ChordInputTag[] = ['/c', '/C', '/x', '/X', '/t', '/T', '/r', '/R']
