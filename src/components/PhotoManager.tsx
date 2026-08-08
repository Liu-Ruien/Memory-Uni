import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { Photo } from '../data/photos'
import { validatePhotoFile } from '../storage/PhotoStorage'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { ImageCropper } from './ImageCropper'

interface PendingPhoto {
  file: File
  imageSrc: string
  isNearTargetRatio: boolean
}

type UploadStage = 'idle' | 'preparing' | 'processing' | 'uploading' | 'success'
type Feedback = { kind: 'info' | 'error' | 'removed'; text: string }

const uploadSteps: Array<{ id: Exclude<UploadStage, 'idle'>; label: string }> = [
  { id: 'preparing', label: '准备上传' },
  { id: 'processing', label: '图片处理中' },
  { id: 'uploading', label: '上传云端' },
  { id: 'success', label: '保存成功' },
]

function UploadProgress({ stage, count }: { stage: Exclude<UploadStage, 'idle'>; count: number }) {
  const activeStep = uploadSteps.findIndex((step) => step.id === stage)
  const heading = stage === 'success'
    ? '新的回忆已经加入'
    : stage === 'preparing'
      ? '准备好这份回忆…'
      : stage === 'processing'
        ? '正在整理这份回忆…'
        : '正在把回忆送往云端…'

  return (
    <motion.div
      key={stage}
      initial={{ opacity: 0, y: 8, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -5, scale: 0.99 }}
      transition={stage === 'success'
        ? { type: 'spring', stiffness: 210, damping: 22, mass: 0.75 }
        : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={`mt-4 rounded-[18px] border px-4 py-4 sm:px-5 ${stage === 'success'
        ? 'border-emerald-700/10 bg-emerald-500/[0.07] dark:border-emerald-200/10 dark:bg-emerald-300/[0.06]'
        : 'border-black/[0.06] bg-white/55 dark:border-white/[0.07] dark:bg-white/[0.03]'}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <motion.span
          initial={stage === 'success' ? { scale: 0.6, rotate: -10 } : false}
          animate={stage === 'success' ? { scale: 1, rotate: 0 } : { rotate: 360 }}
          transition={stage === 'success'
            ? { type: 'spring', stiffness: 240, damping: 18 }
            : { duration: 1.2, ease: 'linear', repeat: Infinity }}
          className={`grid size-8 shrink-0 place-items-center rounded-full text-sm ${stage === 'success'
            ? 'bg-emerald-700 text-white dark:bg-emerald-200 dark:text-emerald-950'
            : 'border border-black/10 text-neutral-500 dark:border-white/15 dark:text-neutral-300'}`}
          aria-hidden="true"
        >
          {stage === 'success' ? '✓' : '·'}
        </motion.span>
        <div>
          <p className="text-sm font-medium tracking-[-0.015em]">{heading}</p>
          <p className="mt-1 text-[10px] text-neutral-400 dark:text-neutral-500">
            {stage === 'success' ? `${count} 张照片已经出现在共同相册中。` : `正在处理 ${count} 张照片，请稍候。`}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-1.5" aria-label="上传进度">
        {uploadSteps.map((step, index) => (
          <div key={step.id} className="min-w-0">
            <div className={`h-0.5 rounded-full transition-colors duration-500 ${index <= activeStep
              ? 'bg-neutral-700 dark:bg-neutral-200'
              : 'bg-black/[0.08] dark:bg-white/[0.1]'}`} />
            <p className={`mt-1.5 truncate text-[8px] sm:text-[9px] ${index <= activeStep
              ? 'text-neutral-600 dark:text-neutral-300'
              : 'text-neutral-300 dark:text-neutral-700'}`}>{step.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

interface PhotoManagerProps {
  isOpen: boolean
  photos: Photo[]
  isLoading: boolean
  storageError: string | null
  onClose: () => void
  onUpload: (files: File[]) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function PhotoManager({ isOpen, photos, isLoading, storageError, onClose, onUpload, onDelete }: PhotoManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [processingFiles, setProcessingFiles] = useState<string[]>([])
  const [deletingIds, setDeletingIds] = useState<string[]>([])
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [uploadStage, setUploadStage] = useState<UploadStage>('idle')
  const [completedUploadCount, setCompletedUploadCount] = useState(0)
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([])
  const [croppedFiles, setCroppedFiles] = useState<File[]>([])
  const [cropTotal, setCropTotal] = useState(0)
  const [photoPendingDeletion, setPhotoPendingDeletion] = useState<Photo | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (photoPendingDeletion) return
      if (event.key === 'Escape' && processingFiles.length === 0 && pendingPhotos.length === 0) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose, pendingPhotos.length, photoPendingDeletion, processingFiles.length])

  useEffect(() => {
    if (isOpen) return
    setFeedback(null)
    setUploadStage('idle')
    setCompletedUploadCount(0)
    setPhotoPendingDeletion(null)
  }, [isOpen])

  const choosePhotos = () => {
    setFeedback(null)
    setUploadStage('idle')
    inputRef.current?.click()
  }

  const inspectPhoto = async (file: File): Promise<PendingPhoto> => {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const aspect = bitmap.width / bitmap.height
    bitmap.close()
    return {
      file,
      imageSrc: URL.createObjectURL(file),
      isNearTargetRatio: Math.abs(aspect - 3 / 4) <= 0.025,
    }
  }

  const handleFiles = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? [])
    if (inputRef.current) inputRef.current.value = ''
    if (files.length === 0) return

    const validationErrors = files.map(validatePhotoFile).filter((error): error is string => Boolean(error))
    const validFiles = files.filter((file) => !validatePhotoFile(file))
    setFeedback(validationErrors.length > 0 ? { kind: 'error', text: validationErrors.join(' ') } : null)
    if (validFiles.length === 0) {
      setUploadStage('idle')
      return
    }

    setUploadStage('preparing')
    setProcessingFiles(validFiles.map((file) => file.name))
    const inspected: PendingPhoto[] = []
    try {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      setUploadStage('processing')
      for (const file of validFiles) inspected.push(await inspectPhoto(file))
      setCropTotal(inspected.length)
      setCroppedFiles([])
      setPendingPhotos(inspected)
    } catch (error) {
      inspected.forEach((photo) => URL.revokeObjectURL(photo.imageSrc))
      void error
      setUploadStage('idle')
      setFeedback({ kind: 'error', text: '这张照片暂时无法整理，请重新选择一张。' })
    } finally {
      setProcessingFiles([])
    }
  }

  const cancelCropping = () => {
    pendingPhotos.forEach((photo) => URL.revokeObjectURL(photo.imageSrc))
    setPendingPhotos([])
    setCroppedFiles([])
    setCropTotal(0)
    setUploadStage('idle')
    setFeedback({ kind: 'info', text: '已取消这次上传，原始照片没有被保存。' })
  }

  const confirmCroppedPhoto = async (file: File) => {
    const currentPhoto = pendingPhotos[0]
    const remainingPhotos = pendingPhotos.slice(1)
    const readyFiles = [...croppedFiles, file]
    if (currentPhoto) URL.revokeObjectURL(currentPhoto.imageSrc)

    if (remainingPhotos.length > 0) {
      setPendingPhotos(remainingPhotos)
      setCroppedFiles(readyFiles)
      return
    }

    setPendingPhotos([])
    setCroppedFiles([])
    setProcessingFiles(readyFiles.map((readyFile) => readyFile.name))
    setUploadStage('uploading')
    setFeedback(null)
    try {
      await onUpload(readyFiles)
      setCompletedUploadCount(readyFiles.length)
      setUploadStage('success')
    } catch (error) {
      void error
      setUploadStage('idle')
      setFeedback({ kind: 'error', text: '这份回忆暂时没有加入，请检查网络后再试。' })
    } finally {
      setProcessingFiles([])
      setCropTotal(0)
    }
  }

  const requestPhotoDeletion = (photo: Photo) => {
    setUploadStage('idle')
    setFeedback(null)
    setPhotoPendingDeletion(photo)
  }

  const confirmPhotoDeletion = async () => {
    const photo = photoPendingDeletion
    if (!photo || deletingIds.includes(photo.id)) return
    setDeletingIds((current) => [...current, photo.id])
    setFeedback(null)
    try {
      await onDelete(photo.id)
      setFeedback({ kind: 'removed', text: '这份回忆已经移除' })
    } catch (error) {
      void error
      setFeedback({ kind: 'error', text: '这份回忆暂时没有移除，请稍后再试。' })
    } finally {
      setDeletingIds((current) => current.filter((id) => id !== photo.id))
      setPhotoPendingDeletion(null)
    }
  }

  const isConfirmingDeletion = Boolean(
    photoPendingDeletion && deletingIds.includes(photoPendingDeletion.id),
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="photo-manager"
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-6 dark:bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !photoPendingDeletion && processingFiles.length === 0 && pendingPhotos.length === 0) onClose()
          }}
          role="presentation"
        >
          <motion.section
            className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[26px] border border-black/[0.08] bg-[#f8f8f6] shadow-[0_30px_90px_rgba(0,0,0,0.2)] dark:border-white/[0.1] dark:bg-[#151515] dark:shadow-[0_30px_100px_rgba(0,0,0,0.6)] sm:rounded-[26px]"
            initial={{ opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.99 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="photo-manager-title"
          >
            <header className="flex items-start justify-between border-b border-black/[0.07] px-5 py-5 dark:border-white/[0.08] sm:px-7 sm:py-6">
              <div>
                <p className="mb-2 text-[9px] font-semibold tracking-[0.23em] text-neutral-400 dark:text-neutral-500">共同数字相册</p>
                <h2 id="photo-manager-title" className="text-xl font-medium tracking-[-0.035em] sm:text-2xl">留下新的回忆</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={processingFiles.length > 0 || pendingPhotos.length > 0 || Boolean(photoPendingDeletion)}
                className="grid size-10 place-items-center rounded-full border border-black/10 bg-white/60 text-lg text-neutral-600 transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-40 dark:border-white/15 dark:bg-white/[0.04] dark:text-neutral-300 dark:hover:bg-white/[0.09]"
                aria-label="关闭照片管理"
              >
                ×
              </button>
            </header>

            <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              <input
                ref={inputRef}
                type="file"
                className="sr-only"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                multiple
                aria-label="选择要上传的照片"
                onChange={(event) => void handleFiles(event.target.files)}
                data-photo-upload-input
              />

              <button
                type="button"
                onClick={choosePhotos}
                disabled={isLoading || processingFiles.length > 0 || pendingPhotos.length > 0 || Boolean(storageError)}
                className="flex min-h-20 w-full items-center justify-between rounded-[18px] border border-dashed border-black/15 bg-white/45 px-5 py-5 text-left transition-colors hover:border-black/30 hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-white/[0.025] dark:hover:border-white/25 dark:hover:bg-white/[0.055] sm:px-6 sm:py-6"
              >
                <span>
                  <span className="block text-sm font-medium">上传照片</span>
                  <span className="mt-1.5 block text-xs text-neutral-400 dark:text-neutral-500">{isLoading ? '正在取回共同回忆…' : '支持 JPG、PNG、WebP · 单张不超过 10 MB'}</span>
                </span>
                <span className="grid size-10 place-items-center rounded-full bg-neutral-900 text-lg text-white dark:bg-neutral-100 dark:text-neutral-900" aria-hidden="true">＋</span>
              </button>

              <AnimatePresence mode="wait">
                {uploadStage !== 'idle' && (
                  <UploadProgress
                    stage={uploadStage}
                    count={uploadStage === 'success' ? completedUploadCount : Math.max(processingFiles.length, cropTotal, 1)}
                  />
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {(feedback || storageError) && (
                  <motion.p
                    key={storageError ?? `${feedback?.kind}-${feedback?.text}`}
                    initial={{ opacity: 0, y: 6, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={feedback?.kind === 'removed' ? { type: 'spring', stiffness: 220, damping: 23 } : { duration: 0.25 }}
                    className={`mt-4 rounded-xl px-4 py-3 text-xs leading-5 ${storageError || feedback?.kind === 'error'
                      ? 'bg-amber-500/[0.08] text-amber-800 dark:text-amber-200'
                      : 'bg-black/[0.035] text-neutral-600 dark:bg-white/[0.05] dark:text-neutral-300'}`}
                    role="status"
                    aria-live="polite"
                  >
                    {storageError ?? feedback?.text}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="mb-4 mt-8 flex items-end justify-between">
                <div>
                  <h3 className="text-sm font-medium">已经留下的回忆</h3>
                  <p className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-500">每一次上传，都会与来到这里的人共享。</p>
                </div>
                <span className="text-[11px] tabular-nums text-neutral-400">{String(photos.length).padStart(2, '0')}</span>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3" role="status" aria-label="共同回忆正在加载">
                  {Array.from({ length: 4 }, (_, index) => (
                    <motion.div
                      key={index}
                      className="aspect-[3/4] animate-pulse rounded-[14px] bg-black/[0.055] dark:bg-white/[0.06]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.06 }}
                    />
                  ))}
                </div>
              ) : photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3">
                  <AnimatePresence initial={false}>
                    {photos.map((photo) => {
                      const deleting = deletingIds.includes(photo.id)
                      return (
                        <motion.div
                          key={photo.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: deleting ? 0.45 : 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.92 }}
                          className="group relative aspect-[3/4] overflow-hidden rounded-[14px] bg-neutral-200 dark:bg-neutral-800"
                        >
                          <img src={photo.src} alt={photo.alt} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => requestPhotoDeletion(photo)}
                            disabled={deleting}
                            className="absolute right-1.5 top-1.5 grid size-10 place-items-center rounded-full border border-white/20 bg-black/55 text-base text-white backdrop-blur-md transition-colors hover:bg-black/75 disabled:cursor-wait sm:size-8 sm:text-sm"
                            aria-label={`删除照片：${photo.title}`}
                          >
                            {deleting ? '·' : '×'}
                          </button>
                          <p className="absolute inset-x-0 bottom-0 truncate bg-black/35 px-2.5 py-2 text-[9px] text-white/90 backdrop-blur-sm">{photo.title}</p>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="rounded-[18px] border border-black/[0.06] px-5 py-9 text-center dark:border-white/[0.07]">
                  <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">这里还没有留下共同回忆，<br />上传第一张照片吧。</p>
                  <button
                    type="button"
                    onClick={choosePhotos}
                    disabled={Boolean(storageError)}
                    className="mt-5 min-h-11 rounded-full bg-neutral-900 px-5 py-2.5 text-xs font-medium text-white transition-transform hover:scale-[1.015] active:scale-[0.985] disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900"
                  >
                    上传第一张照片
                  </button>
                </div>
              )}

              <p className="mt-6 text-[10px] leading-5 text-neutral-400 dark:text-neutral-600">
                这里的照片属于共同相册。删除前，我们会再次向你确认。
              </p>
            </div>
          </motion.section>
        </motion.div>
      )}
      {isOpen && pendingPhotos[0] && (
        <ImageCropper
          key={pendingPhotos[0].imageSrc}
          imageSrc={pendingPhotos[0].imageSrc}
          filename={pendingPhotos[0].file.name}
          current={cropTotal - pendingPhotos.length + 1}
          total={cropTotal}
          isNearTargetRatio={pendingPhotos[0].isNearTargetRatio}
          onCancel={cancelCropping}
          onConfirm={confirmCroppedPhoto}
        />
      )}
      <DeleteConfirmModal
        key="delete-confirm-modal"
        isOpen={isOpen && Boolean(photoPendingDeletion)}
        photo={photoPendingDeletion}
        isDeleting={isConfirmingDeletion}
        onCancel={() => setPhotoPendingDeletion(null)}
        onConfirm={confirmPhotoDeletion}
      />
    </AnimatePresence>
  )
}
