/**包裹list-item类型 */
export const LIST_TYPES: BlockFormat[] = ['numbered-list', 'bulleted-list']
/**包裹其他(paragraph)类型 */
export const OTHER_WRAP_TYPES: BlockFormat[] = ['toogle-list', 'abc-tablature', 'block-quote']
/**全部需要包裹的类型 */
export const NEED_WRAP_TYPES: BlockFormat[] = [...LIST_TYPES, ...OTHER_WRAP_TYPES]

/**仅包裹一层的类型 */
export const ONLY_ONE_WRAP_TYPES: BlockFormat[] = ['block-quote']