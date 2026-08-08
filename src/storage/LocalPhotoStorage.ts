import type { Photo } from '../data/photos'
import { maximumPhotoSize, type PhotoStorage, validatePhotoFile } from './PhotoStorage'

interface StoredPhoto {
  id: string
  blob: Blob
  filename: string
  alt: string
  title: string
  location: string
  date: string
  accentColor: string
  gridAspect: number
  createdAt: number
}

const databaseName = 'my-archive-local-photos'
const storeName = 'photos'
const databaseVersion = 1
const targetAspect = 3 / 4
const maximumOutputWidth = 1440
const webpQuality = 0.88
const accentPalette = ['#c7d4e7', '#d8c8b8', '#bdcbb8', '#d7c0c7', '#b7c9c8', '#ccbca7']

function requestResult<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('无法读取浏览器中的照片数据库。'))
  })
}

function transactionComplete(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error('无法更新浏览器中的照片数据库。'))
    transaction.onabort = () => reject(transaction.error ?? new Error('浏览器照片更新已取消。'))
  })
}

function titleFromFilename(filename: string) {
  const cleanName = filename.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim()
  if (!cleanName) return '未命名的回忆'
  return cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
}

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`
}

async function optimisePhoto(file: File) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const width = bitmap.width
  const height = bitmap.height
  const aspect = width / height

  if (file.type === 'image/webp' && Math.abs(aspect - targetAspect) < 0.001 && width <= maximumOutputWidth) {
    bitmap.close()
    return { blob: file as Blob, width, height }
  }

  const sourceWidth = aspect > targetAspect ? height * targetAspect : width
  const sourceHeight = aspect > targetAspect ? height : width / targetAspect
  const sourceX = (width - sourceWidth) / 2
  const sourceY = (height - sourceHeight) / 2
  const outputWidth = Math.max(1, Math.min(maximumOutputWidth, Math.round(sourceWidth)))
  const outputHeight = Math.round(outputWidth / targetAspect)
  const canvas = document.createElement('canvas')
  canvas.width = outputWidth
  canvas.height = outputHeight
  const context = canvas.getContext('2d', { alpha: false })
  if (!context) {
    bitmap.close()
    throw new Error(`无法处理 ${file.name}。`)
  }

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(bitmap, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, outputWidth, outputHeight)
  bitmap.close()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error(`无法处理 ${file.name}。`))),
      'image/webp',
      webpQuality,
    )
  })

  return { blob, width: outputWidth, height: outputHeight }
}

export class LocalPhotoStorage implements PhotoStorage {
  private databasePromise: Promise<IDBDatabase> | null = null
  private objectUrls = new Map<string, string>()

  private openDatabase() {
    if (!('indexedDB' in window)) {
      return Promise.reject(new Error('当前浏览器不支持 IndexedDB 照片存储。'))
    }

    if (!this.databasePromise) {
      this.databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
        const request = window.indexedDB.open(databaseName, databaseVersion)
        request.onupgradeneeded = () => {
          const database = request.result
          if (!database.objectStoreNames.contains(storeName)) {
            database.createObjectStore(storeName, { keyPath: 'id' })
          }
        }
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error ?? new Error('无法打开本地照片存储。'))
        request.onblocked = () => reject(new Error('本地照片存储正被另一个页面占用，请关闭其他页面后重试。'))
      })
    }

    return this.databasePromise
  }

  private toPhoto(record: StoredPhoto): Photo {
    let src = this.objectUrls.get(record.id)
    if (!src) {
      src = URL.createObjectURL(record.blob)
      this.objectUrls.set(record.id, src)
    }

    return {
      id: record.id,
      src,
      alt: record.alt.startsWith('Locally uploaded photo:')
        ? record.alt.replace('Locally uploaded photo:', '当前浏览器上传的照片：')
        : record.alt,
      title: record.title,
      location: record.location === 'This browser' ? '当前浏览器' : record.location,
      date: record.date,
      accentColor: record.accentColor,
      gridAspect: record.gridAspect,
      source: 'local',
    }
  }

  async getPhotos() {
    const database = await this.openDatabase()
    const transaction = database.transaction(storeName, 'readonly')
    const records = await requestResult(transaction.objectStore(storeName).getAll() as IDBRequest<StoredPhoto[]>)
    return records.sort((first, second) => first.createdAt - second.createdAt).map((record) => this.toPhoto(record))
  }

  async uploadPhotos(files: File[]) {
    const errors = files.map(validatePhotoFile).filter((error): error is string => Boolean(error))
    if (errors.length > 0) throw new Error(errors.join('\n'))
    if (files.some((file) => file.size > maximumPhotoSize)) throw new Error('一张或多张照片超过了 10 MB。')

    const database = await this.openDatabase()
    const uploaded: Photo[] = []

    for (const [index, file] of files.entries()) {
      const processed = await optimisePhoto(file)
      const createdAt = Date.now() + index
      const id = `local-${typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${createdAt}-${Math.random().toString(16).slice(2)}`}`
      const record: StoredPhoto = {
        id,
        blob: processed.blob,
        filename: file.name,
        alt: `当前浏览器上传的照片：${file.name}`,
        title: titleFromFilename(file.name),
        location: '当前浏览器',
        date: currentMonth(),
        accentColor: accentPalette[(createdAt + index) % accentPalette.length],
        gridAspect: targetAspect,
        createdAt,
      }

      const transaction = database.transaction(storeName, 'readwrite')
      transaction.objectStore(storeName).put(record)
      await transactionComplete(transaction)
      uploaded.push(this.toPhoto(record))
    }

    return uploaded
  }

  async deletePhoto(id: string) {
    if (!id.startsWith('local-')) throw new Error('网站自带的回忆照片不能在浏览器管理器中删除。')
    const database = await this.openDatabase()
    const transaction = database.transaction(storeName, 'readwrite')
    transaction.objectStore(storeName).delete(id)
    await transactionComplete(transaction)

    const objectUrl = this.objectUrls.get(id)
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    this.objectUrls.delete(id)
  }
}
