export class IndexedDBHelper {
  constructor(dbName = "dicoding-story-app", storeName = "bookmarks", version = 1) {
    this.dbName = dbName
    this.storeName = storeName
    this.version = version
    this.db = null
  }

  async initDb() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db)
        return
      }

      const request = indexedDB.open(this.dbName, this.version)

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "id" })
        }
      }

      request.onsuccess = (event) => {
        this.db = event.target.result
        resolve(this.db)
      }

      request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.error)
        reject(event.target.error)
      }
    })
  }

  async addStory(story) {
    const db = await this.initDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)
      const request = store.add(story)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = (event) => {
        console.error("Error adding story to IndexedDB:", event.target.error)
        reject(event.target.error)
      }
    })
  }

  async getStories() {
    const db = await this.initDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readonly")
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        console.error("Error getting stories from IndexedDB:", event.target.error)
        reject(event.target.error)
      }
    })
  }

  async getStoryById(id) {
    const db = await this.initDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readonly")
      const store = transaction.objectStore(this.storeName)
      const request = store.get(id)

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        console.error("Error getting story by ID from IndexedDB:", event.target.error)
        reject(event.target.error)
      }
    })
  }

  async deleteStory(id) {
    const db = await this.initDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(id)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = (event) => {
        console.error("Error deleting story from IndexedDB:", event.target.error)
        reject(event.target.error)
      }
    })
  }

  async isStoryBookmarked(id) {
    const db = await this.initDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readonly")
      const store = transaction.objectStore(this.storeName)
      const request = store.count(id)

      request.onsuccess = () => {
        resolve(request.result > 0)
      }

      request.onerror = (event) => {
        console.error("Error checking bookmark status:", event.target.error)
        reject(event.target.error)
      }
    })
  }
}
