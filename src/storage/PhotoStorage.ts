import type { Photo } from '../data/photos'

export interface PhotoStorage {
  getPhotos(): Promise<Photo[]>
  uploadPhotos(files: File[]): Promise<Photo[]>
  deletePhoto(id: string): Promise<void>
}

export const acceptedPhotoTypes = ['image/jpeg', 'image/png', 'image/webp'] as const
export const maximumPhotoSize = 10 * 1024 * 1024

export function validatePhotoFile(file: File): string | null {
  if (!acceptedPhotoTypes.includes(file.type as (typeof acceptedPhotoTypes)[number])) {
    return `${file.name}：仅支持 JPG、PNG 和 WebP 图片。`
  }
  if (file.size > maximumPhotoSize) {
    return `${file.name}：超过了单张 10 MB 的大小限制。`
  }
  return null
}
