const DB_NAME = 'personal-vault'
const DB_VERSION = 1
const STORE = 'files'

function open() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const s = db.createObjectStore(STORE, { keyPath: 'id' })
        s.createIndex('addedAt', 'addedAt')
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export function useVault() {
  const add = async (file) => {
    const db = await open()
    const buf = await file.arrayBuffer()
    const record = {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      data: buf,
      addedAt: new Date().toISOString()
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      const s = tx.objectStore(STORE)
      const req = s.add(record)
      req.onsuccess = () => resolve(record)
      req.onerror = () => reject(req.error)
      tx.oncomplete = () => db.close()
    })
  }

  const list = async () => {
    const db = await open()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const s = tx.objectStore(STORE)
      const idx = s.index('addedAt')
      const req = idx.getAll()
      req.onsuccess = () => resolve(req.result.reverse())
      req.onerror = () => reject(req.error)
      tx.oncomplete = () => db.close()
    })
  }

  const remove = async (id) => {
    const db = await open()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      const s = tx.objectStore(STORE)
      const req = s.delete(id)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
      tx.oncomplete = () => db.close()
    })
  }

  return { add, list, remove }
}
