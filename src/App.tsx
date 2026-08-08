import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { FanCarousel } from './components/FanCarousel'
import { EmptyMemoryState } from './components/EmptyMemoryState'
import { Header } from './components/Header'
import { LandingPage } from './components/LandingPage'
import { PhotoGrid } from './components/PhotoGrid'
import { PhotoManager } from './components/PhotoManager'
import { PhotoViewer } from './components/PhotoViewer'
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

  const openPhoto = (index: number) => {
    setActiveIndex(index)
    setViewerOpen(true)
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

  const activePhoto = allPhotos[activeIndex]

  return (
    <div id="top" className="relative min-h-screen overflow-clip bg-[#f7f7f5] text-neutral-900 transition-colors duration-500 dark:bg-[#0d0d0d] dark:text-neutral-100">
      <Header
        theme={theme}
        onToggleTheme={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
        onOpenPhotoManager={() => setManagerOpen(true)}
      />

      <main className="relative z-10">
        <LandingPage
          photos={allPhotos}
          isLoading={sharedPhotosLoading}
          onStart={() => setManagerOpen(true)}
        />

        <section
          id="memory-section"
          className="relative flex min-h-[100svh] scroll-mt-0 items-center justify-center overflow-hidden py-16 sm:py-20"
          aria-labelledby="university-heading"
        >
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[62vw] max-h-[820px] min-h-[430px] w-[76vw] max-w-[1080px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.14] blur-[120px] dark:opacity-[0.1] sm:blur-[150px]"
            animate={{ backgroundColor: activePhoto?.accentColor ?? '#d8c8b8' }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
          />

          <div className="w-full">
            <motion.h1
              id="university-heading"
              className="text-center text-[clamp(2.15rem,5vw,4.25rem)] font-medium leading-none tracking-[-0.055em] text-neutral-950 dark:text-[#f5f5f1]"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.7 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              Linyi University
            </motion.h1>
            <motion.p
              className="mt-4 text-center text-[10px] tracking-[0.18em] text-neutral-500 dark:text-neutral-400 sm:mt-5 sm:text-[11px]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.7 }}
              transition={{ duration: 0.5, delay: 0.12 }}
            >
              2022.09–2026.06
            </motion.p>

            {allPhotos.length > 0 ? (
              <FanCarousel
                photos={allPhotos}
                activeIndex={activeIndex}
                onActiveIndexChange={setActiveIndex}
                onOpen={() => setViewerOpen(true)}
                keyboardEnabled={!viewerOpen && !managerOpen}
              />
            ) : (
              <EmptyMemoryState isLoading={sharedPhotosLoading} onUpload={() => setManagerOpen(true)} />
            )}
          </div>
        </section>

        {(allPhotos.length > 0 || sharedPhotosLoading) && (
          <PhotoGrid photos={allPhotos} isLoading={sharedPhotosLoading} onSelect={openPhoto} />
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
