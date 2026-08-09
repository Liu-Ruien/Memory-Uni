import { useEffect, useMemo, useState } from 'react'
import { EmptyMemoryState } from './components/EmptyMemoryState'
import { Header } from './components/Header'
import { LandingPage } from './components/LandingPage'
import { MemoryTimeline } from './components/MemoryTimeline'
import { PhotoManager } from './components/PhotoManager'
import { PhotoViewer } from './components/PhotoViewer'
import { YearMemoryGallery } from './components/YearMemoryGallery'
import { academicYears, getAcademicYearId, type AcademicYearId } from './data/academicYears'
import { photos as archivePhotos, type Photo } from './data/photos'
import type { PhotoStorage } from './storage/PhotoStorage'
import { SupabasePhotoStorage } from './storage/SupabasePhotoStorage'

type Theme = 'light' | 'dark'
const photoStorage: PhotoStorage = new SupabasePhotoStorage()

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const saved = window.localStorage.getItem('archive-theme')
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [managerOpen, setManagerOpen] = useState(false)
  const [sharedPhotos, setSharedPhotos] = useState<Photo[]>([])
  const [sharedPhotosLoading, setSharedPhotosLoading] = useState(true)
  const [storageError, setStorageError] = useState<string | null>(null)
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const allPhotos = useMemo(() => [...archivePhotos, ...sharedPhotos], [sharedPhotos])
  const photosByYear = useMemo(
    () => academicYears.map((year) => ({
      year,
      photos: allPhotos.filter((photo) => getAcademicYearId(photo) === year.id),
    })),
    [allPhotos],
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem('archive-theme', theme)
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    metaTheme?.setAttribute('content', theme === 'dark' ? '#0d0d0d' : '#f7f7f5')
  }, [theme])

  useEffect(() => {
    let cancelled = false
    const timeoutId = window.setTimeout(() => {
      if (cancelled) return
      setSharedPhotosLoading(false)
      setStorageError('共同回忆暂时没有加载出来，请稍后再试。')
    }, 10_000)

    photoStorage
      .getPhotos()
      .then((storedPhotos) => {
        if (!cancelled) {
          setSharedPhotos(storedPhotos)
          setStorageError(null)
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          void error
          setStorageError('共同回忆暂时没有加载出来，请稍后再试。')
        }
      })
      .finally(() => {
        window.clearTimeout(timeoutId)
        if (!cancelled) setSharedPhotosLoading(false)
      })
    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    if (activeIndex >= allPhotos.length) setActiveIndex(Math.max(0, allPhotos.length - 1))
  }, [activeIndex, allPhotos.length])

  const openPhoto = (photoId: string) => {
    const index = allPhotos.findIndex((photo) => photo.id === photoId)
    if (index < 0) return
    setActiveIndex(index)
    setViewerOpen(true)
  }

  const scrollToYear = (yearId: AcademicYearId) => {
    document.getElementById(`year-${yearId}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const uploadPhotos = async (files: File[]) => {
    const uploadedPhotos = await photoStorage.uploadPhotos(files)
    setSharedPhotos((current) => {
      const uploadedIds = new Set(uploadedPhotos.map((photo) => photo.id))
      return [...uploadedPhotos, ...current.filter((photo) => !uploadedIds.has(photo.id))]
    })
  }

  const deletePhoto = async (id: string) => {
    const currentPhotoId = allPhotos[activeIndex]?.id
    const deletedIndex = allPhotos.findIndex((photo) => photo.id === id)
    await photoStorage.deletePhoto(id)
    const remainingSharedPhotos = sharedPhotos.filter((photo) => photo.id !== id)
    const remainingPhotos = [...archivePhotos, ...remainingSharedPhotos]
    setSharedPhotos(remainingSharedPhotos)

    const preservedIndex = remainingPhotos.findIndex((photo) => photo.id === currentPhotoId)
    setActiveIndex(remainingPhotos.length === 0
      ? 0
      : preservedIndex >= 0
        ? preservedIndex
        : Math.min(Math.max(0, deletedIndex), remainingPhotos.length - 1))
  }

  return (
    <div id="top" className="relative min-h-screen overflow-clip bg-[#f7f7f5] text-neutral-900 transition-colors duration-500 dark:bg-[#0d0d0d] dark:text-neutral-100">
      <Header
        theme={theme}
        onToggleTheme={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
        onOpenPhotoManager={() => setManagerOpen(true)}
      />

      <main className="relative z-10">
        <LandingPage />
        <MemoryTimeline onSelectYear={scrollToYear} />

        {allPhotos.length > 0 ? (
          photosByYear.map(({ year, photos }) => (
            <YearMemoryGallery
              key={year.id}
              year={year}
              photos={photos}
              onSelect={openPhoto}
            />
          ))
        ) : (
          <section className="mx-auto max-w-[920px] px-5 pb-28 sm:px-8 sm:pb-36">
            <EmptyMemoryState isLoading={sharedPhotosLoading} onUpload={() => setManagerOpen(true)} />
          </section>
        )}

        <section id="about" className="mx-auto max-w-[1320px] scroll-mt-24 px-5 pb-32 pt-8 sm:px-8 sm:pb-40 sm:pt-16 lg:px-12">
          <div className="grid gap-8 border-t border-black/[0.07] pt-12 dark:border-white/[0.08] sm:grid-cols-[1fr_2fr] sm:pt-16">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-neutral-400 dark:text-neutral-500">关于这段记录</p>
            <p className="max-w-xl text-xl font-normal leading-[1.45] tracking-[-0.025em] text-neutral-700 dark:text-neutral-300 sm:text-2xl">
              这里没有完整的故事，只有一些被时间留下的片段。它们提醒我，那些看似普通的日子，也曾真实地构成我们的人生。
            </p>
          </div>
        </section>
      </main>

      <footer className="relative z-10 mx-auto flex max-w-[1320px] items-center justify-between border-t border-black/[0.08] px-5 py-8 text-[11px] text-neutral-400 dark:border-white/[0.09] dark:text-neutral-600 sm:px-8 lg:px-12">
        <p>把那些日子，好好留下。</p>
        <p className="tabular-nums">2022—2026</p>
      </footer>

      {allPhotos.length > 0 && (
        <PhotoViewer
          photos={allPhotos}
          activeIndex={activeIndex}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          onActiveIndexChange={setActiveIndex}
        />
      )}

      <PhotoManager
        isOpen={managerOpen}
        photos={sharedPhotos}
        isLoading={sharedPhotosLoading}
        storageError={storageError}
        onClose={() => setManagerOpen(false)}
        onUpload={uploadPhotos}
        onDelete={deletePhoto}
      />
    </div>
  )
}

export default App
