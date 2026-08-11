import type { Photo } from '../data/photos'
import type { AcademicYearId } from '../data/academicYears'
import { formatTakenAt, getRememberedAcademicYear, getRememberedTakenAt } from '../lib/photoTakenAt'
import { getSupabaseClient } from '../lib/supabase'
import { maximumPhotoSize, type PhotoStorage, validatePhotoFile } from './PhotoStorage'

interface PhotoRecord {
  id: string
  url: string
  title: string | null
  location: string | null
  date: string | null
  taken_at: string | null
  academic_year?: string | null
  created_at: string
  storage_path: string
}

interface UploadedRecord {
  id: string
  storagePath: string
}

const bucketName = 'memory-photos'
const selectedColumns = 'id, url, title, location, date, taken_at, academic_year, created_at, storage_path'
const legacySelectedColumns = 'id, url, title, location, date, taken_at, created_at, storage_path'
const accentPalette = ['#c7d4e7', '#d8c8b8', '#bdcbb8', '#d7c0c7', '#b7c9c8', '#ccbca7']

function accentForId(id: string) {
  const index = Array.from(id).reduce((sum, character) => sum + character.charCodeAt(0), 0) % accentPalette.length
  return accentPalette[index]
}

function isAcademicYearId(value: unknown): value is AcademicYearId {
  return value === 'freshman' || value === 'sophomore' || value === 'junior' || value === 'senior'
}

function isMissingAcademicYearColumn(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const code = 'code' in error ? String(error.code) : ''
  const message = 'message' in error ? String(error.message).toLowerCase() : ''
  return message.includes('academic_year') && (
    code === '42703'
    || code === 'PGRST204'
    || message.includes('does not exist')
    || message.includes('schema cache')
  )
}

function toPhoto(record: PhotoRecord): Photo {
  const formattedTakenAt = formatTakenAt(record.taken_at)
  const displayTitle = formattedTakenAt ? `拍摄于 ${formattedTakenAt}` : '拍摄时间未知'
  return {
    id: record.id,
    src: record.url,
    alt: `共同回忆照片，${displayTitle}`,
    title: displayTitle,
    location: record.location?.trim() || '',
    date: record.date?.trim() || '',
    accentColor: accentForId(record.id),
    gridAspect: 3 / 4,
    source: 'supabase',
    takenAt: record.taken_at ?? undefined,
    academicYear: isAcademicYearId(record.academic_year) ? record.academic_year : undefined,
  }
}

function storagePathFor() {
  const id = typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  const yearMonth = new Date().toISOString().slice(0, 7)
  return `photos/${yearMonth}/${id}.webp`
}

function readableError(action: string, error: unknown) {
  if (error instanceof Error) return `${action}：${error.message}`
  if (typeof error === 'object' && error && 'message' in error) return `${action}：${String(error.message)}`
  return `${action}，请检查网络连接和 Supabase 配置后重试。`
}

export class SupabasePhotoStorage implements PhotoStorage {
  private storagePaths = new Map<string, string>()

  async getPhotos() {
    const client = getSupabaseClient()
    const result = await client
      .from('photos')
      .select(selectedColumns)
      .order('created_at', { ascending: false })

    if (isMissingAcademicYearColumn(result.error)) {
      const legacyResult = await client
        .from('photos')
        .select(legacySelectedColumns)
        .order('created_at', { ascending: false })
      if (legacyResult.error) throw new Error(readableError('共享图库加载失败', legacyResult.error))
      const legacyRecords = (legacyResult.data ?? []) as PhotoRecord[]
      legacyRecords.forEach((record) => this.storagePaths.set(record.id, record.storage_path))
      return legacyRecords.map(toPhoto)
    }

    if (result.error) throw new Error(readableError('共享图库加载失败', result.error))

    const records = (result.data ?? []) as PhotoRecord[]
    records.forEach((record) => this.storagePaths.set(record.id, record.storage_path))
    return records.map(toPhoto)
  }

  async uploadPhotos(files: File[]) {
    const validationErrors = files.map(validatePhotoFile).filter((error): error is string => Boolean(error))
    if (validationErrors.length > 0) throw new Error(validationErrors.join('\n'))
    if (files.some((file) => file.size > maximumPhotoSize)) throw new Error('一张或多张照片超过了 10 MB。')
    if (files.some((file) => file.type !== 'image/webp')) throw new Error('照片必须先完成 3:4 裁剪并转换为 WebP。')

    const client = getSupabaseClient()
    const uploadedPhotos: Photo[] = []
    const createdRecords: UploadedRecord[] = []

    try {
      for (const file of files) {
        const takenAt = getRememberedTakenAt(file)
        if (!takenAt) throw new Error('请先确认照片的拍摄时间。')
        const academicYear = getRememberedAcademicYear(file)
        if (!academicYear) throw new Error('请先选择照片所属的大学阶段。')
        const storagePath = storagePathFor()
        const { error: storageError } = await client.storage
          .from(bucketName)
          .upload(storagePath, file, {
            cacheControl: '31536000',
            contentType: 'image/webp',
            upsert: false,
          })

        if (storageError) throw new Error(readableError(`“${file.name}”上传到 Storage 失败`, storageError))

        const { data: publicUrlData } = client.storage.from(bucketName).getPublicUrl(storagePath)
        const modernInsert = await client
          .from('photos')
          .insert({
            url: publicUrlData.publicUrl,
            title: '未命名回忆',
            location: null,
            date: null,
            taken_at: takenAt,
            academic_year: academicYear,
            storage_path: storagePath,
          })
          .select(selectedColumns)
          .single()

        let insertedData = modernInsert.data as PhotoRecord | null
        let databaseError: unknown = modernInsert.error

        if (isMissingAcademicYearColumn(modernInsert.error)) {
          const legacyInsert = await client
            .from('photos')
            .insert({
              url: publicUrlData.publicUrl,
              title: '未命名回忆',
              location: null,
              date: null,
              taken_at: takenAt,
              storage_path: storagePath,
            })
            .select(legacySelectedColumns)
            .single()
          insertedData = legacyInsert.data as PhotoRecord | null
          databaseError = legacyInsert.error
        }

        if (databaseError || !insertedData) {
          const { error: cleanupError } = await client.storage.from(bucketName).remove([storagePath])
          const cleanupMessage = cleanupError ? '；同时未能清理已上传文件，请在 Supabase 控制台检查孤立文件' : ''
          throw new Error(`${readableError(`“${file.name}”的数据库记录创建失败`, databaseError)}${cleanupMessage}`)
        }

        const record = insertedData as PhotoRecord
        createdRecords.push({ id: record.id, storagePath })
        this.storagePaths.set(record.id, storagePath)
        uploadedPhotos.unshift(toPhoto(record))
      }

      return uploadedPhotos
    } catch (error) {
      const rollbackErrors: string[] = []
      for (const record of createdRecords.reverse()) {
        const { error: storageRollbackError } = await client.storage.from(bucketName).remove([record.storagePath])
        const { error: databaseRollbackError } = await client.from('photos').delete().eq('id', record.id)
        if (storageRollbackError) rollbackErrors.push(readableError('Storage 回滚失败', storageRollbackError))
        if (databaseRollbackError) rollbackErrors.push(readableError('数据库回滚失败', databaseRollbackError))
        this.storagePaths.delete(record.id)
      }
      const originalError = error instanceof Error ? error : new Error(readableError('照片上传失败', error))
      if (rollbackErrors.length > 0) {
        throw new Error(`${originalError.message}；部分回滚操作失败：${rollbackErrors.join('；')}`)
      }
      throw originalError
    }
  }

  async deletePhoto(id: string) {
    if (id.startsWith('archive-')) throw new Error('网站自带的回忆照片不能从共享图库中删除。')

    const client = getSupabaseClient()
    let storagePath = this.storagePaths.get(id)

    if (!storagePath) {
      const { data, error } = await client.from('photos').select('storage_path').eq('id', id).single()
      if (error || !data?.storage_path) throw new Error(readableError('找不到这张照片的 Storage 路径', error))
      storagePath = String(data.storage_path)
    }

    const { data: removedObjects, error: storageError } = await client.storage.from(bucketName).remove([storagePath])
    if (storageError) throw new Error(readableError('Storage 文件删除失败', storageError))
    if (!removedObjects || removedObjects.length === 0) {
      throw new Error('Storage 文件没有被删除。请确认已执行最新的 supabase/setup.sql（删除操作同时需要 SELECT 与 DELETE 策略）。')
    }

    const { error: databaseError } = await client.from('photos').delete().eq('id', id)
    if (databaseError) {
      throw new Error(`${readableError('数据库记录删除失败', databaseError)}。Storage 文件已经删除，请在 Supabase 控制台清理该记录。`)
    }

    this.storagePaths.delete(id)
  }
}
