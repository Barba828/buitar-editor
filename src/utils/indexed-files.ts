import { Descendant } from 'slate'
import { IndexedDBManager } from '~common/utils/indexedDB.ts'

export type FileData = {
  id: number
  title: string
  createTime: number
  updateTime: number
  values: Descendant[]
}

const dbManager = new IndexedDBManager<FileData>('editorFiles', 1)

export { dbManager }
