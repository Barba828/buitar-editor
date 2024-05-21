import { createContext, FC, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { fileDbManager, FileData, initFileList } from './indexed-files'
import { getTitle } from '~/editor/utils/get-title'

interface FilesContextType {
  doc?: FileData
  setDoc: React.Dispatch<React.SetStateAction<FileData | undefined>>
  fileList: FileData[]
  setFileList: React.Dispatch<React.SetStateAction<FileData[]>>

  readFiles: () => Promise<FileData[]>
  addFile: (values?: FileData['values']) => Promise<void>
  updateFile: () => Promise<void>
  deleteFile: (id: FileData['id']) => Promise<void>
}

const FilesContext = createContext<FilesContextType | undefined>(undefined)

export const FilesProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [fileList, setFileList] = useState<FileData[]>([])
  const [doc, setDoc] = useState<FileData>()

  const readFiles = useCallback(async () => {
    await fileDbManager.open()
    const list = await fileDbManager.getAllData()
    setFileList(list)
    return list
  }, [])

  const addFile = useCallback(
    async (_values?: FileData['values']) => {
      const id = new Date().getTime()
      const values = _values?.length
        ? _values
        : ([
          {
            type: 'paragraph',
            children: [
              {
                text: '',
              },
            ],
          },
        ] as FileData['values'])
      const title = getTitle(values)

      const newFile = {
        id,
        createTime: id,
        updateTime: id,
        title,
        values,
      } as FileData
      fileDbManager.addData(newFile)
      await readFiles()
      setDoc(newFile)
    },
    [readFiles]
  )

  const updateFile = useCallback(async () => {
    if (!window.editor?.children) {
      return
    }
    const values = window.editor.children
    const title = getTitle(values)
    const updateTime = new Date().getTime()

    if (doc) {
      const newDoc = {
        ...doc,
        updateTime,
        title,
        values: values,
      }
      fileDbManager.updateData(newDoc)
      setDoc(newDoc)
    }
    await readFiles()
  }, [doc, readFiles])

  const deleteFile = useCallback(
    async (id: FileData['id']) => {
      fileDbManager.deleteDataById(id)
      await readFiles()
      setDoc(undefined)
      if (window.editor) {
        window.editor.children = [
          {
            type: 'paragraph',
            children: [
              {
                text: '',
              },
            ],
          },
        ]
      }
    },
    [readFiles]
  )

  useEffect(() => {
    const initList = () => {
      readFiles().then((_list) => {
        if (_list.length) {
          setDoc(_list[0])
        } else {
          initFileList().then(() => initList())
        }
      })
    }
    initList()
  }, [readFiles])

  const value = {
    doc,
    setDoc,
    fileList,
    setFileList,

    readFiles,
    addFile,
    updateFile,
    deleteFile,
  }

  return <FilesContext.Provider value={value}>{children}</FilesContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFilesContext = () => {
  return useContext(FilesContext)
}
