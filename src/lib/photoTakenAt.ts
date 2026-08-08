const takenAtByFile = new WeakMap<File, string>()

function toDateInputValue(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  if (typeof value !== 'string') return null
  const match = value.match(/^(\d{4})[:/-](\d{2})[:/-](\d{2})/)
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null
}

export function isValidTakenAt(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export function formatTakenAt(value?: string | null) {
  if (!value) return null
  return toDateInputValue(value)
}

export async function readExifTakenAt(_file: File): Promise<string | null> {
  // 手机与电脑统一由用户确认拍摄日期，避免不同设备保留 EXIF 的行为不一致。
  return null
}

export function rememberTakenAt(file: File, takenAt: string) {
  takenAtByFile.set(file, takenAt)
}

export function getRememberedTakenAt(file: File) {
  return takenAtByFile.get(file)
}
