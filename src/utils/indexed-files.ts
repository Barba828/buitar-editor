import { Descendant } from 'slate'
import { IndexedDBManager } from '~common/utils/indexedDB.ts'
import chordCard from '~/utils/files/chord-card.json'
import tablatureBlock from '~/utils/files/tablature-block.json'

export type FileData = {
  id: number
  title: string
  createTime: number
  updateTime: number
  values: Descendant[]
}

const fileDbManager = new IndexedDBManager<FileData>('editorFiles', 1)

/**
 * 初始化默认文档
 */
const initFileList = async () => {
  await fileDbManager.open()
  const now = Date.now()
  await fileDbManager.addData({
    id: now,
    title: 'Chord Card',
    createTime: now,
    updateTime: now,
    values: chordCard,
  } as FileData)
  await fileDbManager.addData({
    id: now + 828,
    title: 'Tablature Block',
    createTime: now + 828,
    updateTime: now + 828,
    values: tablatureBlock,
  } as FileData)
}

export { fileDbManager, initFileList }
