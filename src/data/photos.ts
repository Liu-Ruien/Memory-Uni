import type { AcademicYearId } from './academicYears'

export interface Photo {
  id: string
  src: string
  alt: string
  title: string
  location: string
  date: string
  accentColor: string
  gridAspect: number
  source: 'archive' | 'local' | 'supabase'
  uploadedAt?: string
  takenAt?: string
  academicYear?: AcademicYearId
}

export const photos: Photo[] = []
