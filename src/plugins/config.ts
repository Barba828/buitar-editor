/**列表包裹类型(内部仅list-item) */
export const LIST_TYPES: BlockFormat[] = ['numbered-list', 'bulleted-list']
/**包裹其他(paragraph/heading/list/...)类型 */
export const OTHER_WRAP_TYPES: BlockFormat[] = [
  'toogle-list',
  'block-quote',
  'code-block',
  'abc-tablature',
  'block-tablature',
]
/**全部需要包裹的类型 */
export const NEED_WRAP_TYPES: BlockFormat[] = [...LIST_TYPES, ...OTHER_WRAP_TYPES]

/**仅包裹一层的类型(内部无法包裹自身类型) */
export const ONLY_ONE_WRAP_TYPES: BlockFormat[] = [
  'block-quote',
  'abc-tablature',
  'block-tablature',
  'code-block',
]
/**内部不支持富文本(内部仅paragraph) */
export const NONE_RICH_WRAP_TYPES: BlockFormat[] = [
  'abc-tablature',
  'block-tablature',
  'code-block',
]
