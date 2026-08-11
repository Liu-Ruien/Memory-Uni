import type { Photo } from './photos'

export type AcademicYearId = 'freshman' | 'sophomore' | 'junior' | 'senior'

export interface AcademicYear {
  id: AcademicYearId
  number: string
  title: string
  period: string
  description: string
  cardClassName: string
  rotation: number
}

export const academicYears: AcademicYear[] = [
  {
    id: 'freshman',
    number: '01',
    title: '大一 · 初见',
    period: '2022.09—2023.08',
    description: '第一次把陌生的名字，写进共同的故事。',
    cardClassName: 'bg-[#eee6d6] dark:bg-[#332f27]',
    rotation: -2.2,
  },
  {
    id: 'sophomore',
    number: '02',
    title: '大二 · 探索',
    period: '2023.09—2024.08',
    description: '在熟悉的校园里，开始走向更远的地方。',
    cardClassName: 'bg-[#dde8ef] dark:bg-[#25313a]',
    rotation: 1.8,
  },
  {
    id: 'junior',
    number: '03',
    title: '大三 · 沉淀',
    period: '2024.09—2025.08',
    description: '忙碌与成长，让我们慢慢成为想成为的人。',
    cardClassName: 'bg-[#e7e0ee] dark:bg-[#312b38]',
    rotation: -1.4,
  },
  {
    id: 'senior',
    number: '04',
    title: '大四 · 出发',
    period: '2025.09—2026.06',
    description: '带着四年的回声，走向各自的远方。',
    cardClassName: 'bg-[#dfe9dc] dark:bg-[#283329]',
    rotation: 2,
  },
]

export function getAcademicYearId(photo: Photo): AcademicYearId {
  if (photo.academicYear) return photo.academicYear

  const takenDate = photo.takenAt?.slice(0, 10)

  if (!takenDate) return 'senior'
  if (takenDate < '2023-09-01') return 'freshman'
  if (takenDate < '2024-09-01') return 'sophomore'
  if (takenDate < '2025-09-01') return 'junior'
  return 'senior'
}
