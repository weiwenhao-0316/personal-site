const DB_NAME = 'personal-site-ui'
const DB_VERSION = 1
const STORE = 'wallpapers'
const HOME_KEY = 'home'

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function getStore(mode) {
  const db = await openDb()
  const tx = db.transaction(STORE, mode)
  return { db, tx, store: tx.objectStore(STORE) }
}

export function useWallpaperStore() {
  const loadHomeWallpaper = async () => {
    const { db, tx, store } = await getStore('readonly')

    return new Promise((resolve, reject) => {
      const req = store.get(HOME_KEY)
      req.onsuccess = () => resolve(req.result?.blob || null)
      req.onerror = () => reject(req.error)
      tx.oncomplete = () => db.close()
      tx.onerror = () => reject(tx.error)
    })
  }

  const saveHomeWallpaper = async (blob) => {
    const { db, tx, store } = await getStore('readwrite')

    return new Promise((resolve, reject) => {
      const req = store.put({
        id: HOME_KEY,
        blob,
        type: blob.type,
        size: blob.size,
        updatedAt: new Date().toISOString(),
      })
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
      tx.oncomplete = () => db.close()
      tx.onerror = () => reject(tx.error)
    })
  }

  return { loadHomeWallpaper, saveHomeWallpaper }
}

