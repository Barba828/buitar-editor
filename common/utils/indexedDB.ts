export class IndexedDBManager<T extends { id?: string | number }> {
  private dbName: string
  private dbVersion: number
  private db: IDBDatabase | null = null

  constructor(dbName: string, dbVersion: number) {
    this.dbName = dbName
    this.dbVersion = dbVersion
  }

  public open(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error)
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data', { keyPath: 'id', autoIncrement: true })
        }
      }
    })
  }

  public addData(data: T): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB database not open'))
        return
      }

      const transaction = this.db.transaction(['data'], 'readwrite')
      const objectStore = transaction.objectStore('data')

      const request = objectStore.add(data)

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error)
      }

      request.onsuccess = () => {
        resolve()
      }
    })
  }

  public updateData(updatedItem: T): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB database not open'))
        return
      }

      if (!updatedItem.id) {
        reject(new Error('Item must have an id to be updated'))
        return
      }

      const transaction = this.db.transaction(['data'], 'readwrite')
      const objectStore = transaction.objectStore('data')

      const request = objectStore.put(updatedItem)

      request.onerror = (event: Event) => {
        console.error('Error updating data:', (event.target as IDBRequest).error)
        reject((event.target as IDBRequest).error)
      }

      request.onsuccess = () => {
        console.log('Data updated successfully')
        resolve()
      }
    })
  }

  public getDataById(id: number): Promise<T | undefined> {
    return new Promise<T | undefined>((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB database not open'))
        return
      }

      const transaction = this.db.transaction(['data'], 'readonly')
      const objectStore = transaction.objectStore('data')
      const request = objectStore.get(id)

      request.onerror = (event: Event) => {
        console.error('Error fetching data by ID:', (event.target as IDBRequest).error)
        reject((event.target as IDBRequest).error)
      }

      request.onsuccess = () => {
        resolve(request.result as T | undefined)
      }
    })
  }

  public getAllData(): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB database not open'))
        return
      }

      const transaction = this.db.transaction(['data'], 'readonly')
      const objectStore = transaction.objectStore('data')
      const request = objectStore.getAll()

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error)
      }

      request.onsuccess = () => {
        resolve(request.result)
      }
    })
  }

  public deleteDataById(id: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.db) {
        reject(new Error("IndexedDB database not open"));
        return;
      }

      const transaction = this.db.transaction(["data"], "readwrite");
      const objectStore = transaction.objectStore("data");
      const request = objectStore.delete(id);

      request.onerror = (event: Event) => {
        console.error("Error deleting data:", (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };

      request.onsuccess = () => {
        console.log("Data deleted successfully");
        resolve();
      };
    });
  }


  public close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

export default IndexedDBManager
