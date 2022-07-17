export class Storage {
  static dbName = 'VK-search'

  constructor (name, version = 1, options = {}) {
    this.name = name
    this.version = version
    this.options = { keyPath: 'id', ...options }
    this.db = null
  }

  build() {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(Storage.dbName, this.version)

      openRequest.onupgradeneeded = () => {
        console.log('onupgradeneeded')

        const { result } = openRequest;

        if (!result.objectStoreNames.contains(this.name)) {
          result.createObjectStore(this.name, this.options);
        }
      }

      openRequest.onsuccess = () => {
        console.log('onsuccess')
        this.db = openRequest.result
        resolve()
      }

      openRequest.onerror = (e) => {
        console.log('onerror')
        reject(e)
      }
    })
  }

  async add(item) {
    const tx = this.db.transaction(this.name, 'readwrite')

    try {
      await tx.objectStore(this.name).add(item)
    } catch(err) {
      if (err.name === 'ConstraintError') {
        console.warn('Такая запись уже существует')
      } else {
        throw err;
      }
    }
  }

  async getAll() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.name)
      const store = tx.objectStore(this.name)

      const request = store.getAll()
      request.onsuccess = () => {
        resolve(request.result)
      }
      request.onerror = (e) => {
        reject(e)
      }
    })
  }

  static destroy() {
    indexedDB.deleteDatabase(Storage.dbName)
  }
}