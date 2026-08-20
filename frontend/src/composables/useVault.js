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

function txDone(tx, db, resolve, reject, value) {
  tx.oncomplete = () => {
    db.close()
    resolve(value)
  }
  tx.onerror = () => {
    db.close()
    reject(tx.error)
  }
}

export function useVault() {
  const add = async (file) => {
    const db = await open()
    const buf = await file.arrayBuffer()
    const record = {
      id: crypto.randomUUID(),
      kind: 'file',
      name: file.name,
      title: file.name,
      type: file.type,
      size: file.size,
      data: buf,
      note: '',
      addedAt: new Date().toISOString(),
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      const s = tx.objectStore(STORE)
      const req = s.add(record)
      req.onerror = () => reject(req.error)
      txDone(tx, db, resolve, reject, record)
    })
  }

  const addLink = async (payload) => {
    const db = await open()
    const record = {
      id: crypto.randomUUID(),
      kind: 'link',
      title: payload.title?.trim() || '未命名链接',
      name: payload.title?.trim() || '未命名链接',
      url: payload.url?.trim() || '#',
      note: payload.note?.trim() || '',
      type: 'text/uri-list',
      size: 0,
      addedAt: new Date().toISOString(),
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      const s = tx.objectStore(STORE)
      const req = s.add(record)
      req.onerror = () => reject(req.error)
      txDone(tx, db, resolve, reject, record)
    })
  }

  const list = async () => {
    const db = await open()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const s = tx.objectStore(STORE)
      const idx = s.index('addedAt')
      const req = idx.getAll()
      req.onsuccess = () => {
        const records = req.result
          .map(record => ({ kind: record.kind || 'file', ...record }))
          .reverse()
        resolve(records)
      }
      req.onerror = () => reject(req.error)
      txDone(tx, db, () => {}, reject)
    })
  }

  const get = async (id) => {
    const db = await open()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const s = tx.objectStore(STORE)
      const req = s.get(id)
      req.onsuccess = () => resolve(req.result ? { kind: req.result.kind || 'file', ...req.result } : null)
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
      req.onerror = () => reject(req.error)
      txDone(tx, db, resolve, reject)
    })
  }

  return { add, addLink, list, get, remove }
}
