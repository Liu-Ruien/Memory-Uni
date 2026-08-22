import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { AcademicYearId } from '../data/academicYears'
import type { Photo } from '../data/photos'
import { appleEaseOut, appleSpring } from '../design/motion'
import type { AcademicYearSchemaStatus } from '../hooks/useAcademicYearSchema'
import { useDialogFocusScope } from '../hooks/useDialogFocusScope'
import { detectPhotoAspect, isNearPhotoAspect, type PhotoAspectPreset } from '../lib/photoAspect'
import { isValidTakenAt, readExifTakenAt, rememberAcademicYear, rememberTakenAt } from '../lib/photoTakenAt'
import { validatePhotoFile } from '../storage/PhotoStorage'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { ImageCropper } from './ImageCropper'
import { MemorySaveProgress, type MemorySaveStage } from './MemorySaveProgress'
import { TakenDateModal } from './TakenDateModal'

interface PendingPhoto {
  file: File
  imageSrc: string
  isNearTargetRatio: boolean
  aspectPreset: PhotoAspectPreset
  takenAt?: string
  academicYear?: AcademicYearId
}

type UploadStage = 'idle' | MemorySaveStage
type Feedback = { kind: 'info' | 'error' | 'removed'; text: string }

interface PhotoManagerProps {
  isOpen: boolean
  photos: Photo[]
  isLoading: boolean
  storageError: string | null
  academicYearSchemaStatus: AcademicYearSchemaStatus
  onClose: () => void
  onUpload: (files: File[]) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function PhotoManager({ isOpen, photos, isLoading, storageError, academicYearSchemaStatus, onClose, onUpload, onDelete }: PhotoManagerProps) {
  const reduceMotion = useReducedMotion()
  const inputRef = useRef<HTMLInputElement>(null)
  const [processingFiles, setProcessingFiles] = useState<string[]>([])
  const [deletingIds, setDeletingIds] = useState<string[]>([])
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [uploadStage, setUploadStage] = useState<UploadStage>('idle')
  const [completedUploadCount, setCompletedUploadCount] = useState(0)
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([])
  const [preparedPhotos, setPreparedPhotos] = useState<PendingPhoto[]>([])
  const [takenDateInput, setTakenDateInput] = useState('')
  const [academicYearInput, setAcademicYearInput] = useState<AcademicYearId | ''>('')
  const [takenDateError, setTakenDateError] = useState<string | null>(null)
  const [croppedFiles, setCroppedFiles] = useState<File[]>([])
  const [cropTotal, setCropTotal] = useState(0)
  const [photoPendingDeletion, setPhotoPendingDeletion] = useState<Photo | null>(null)
  const managerDialogRef = useDialogFocusScope<HTMLElement>(isOpen, {
    onEscape: () => {
      if (
        !photoPendingDeletion
        && processingFiles.length === 0
        && pendingPhotos.length === 0
        && preparedPhotos.length === 0
      ) onClose()
    },
  })

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

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
    const [bitmap, takenAt] = await Promise.all([
      createImageBitmap(file, { imageOrientation: 'from-image' }),
      readExifTakenAt(file),
    ])
    const aspectPreset = detectPhotoAspect(bitmap.width, bitmap.height)
    const isNearTargetRatio = isNearPhotoAspect(bitmap.width, bitmap.height, aspectPreset)
    bitmap.close()
    return {
      file,
      imageSrc: URL.createObjectURL(file),
      isNearTargetRatio,
      aspectPreset,
      takenAt: takenAt ?? undefined,
    }
  }

  const beginCropping = (photos: PendingPhoto[]) => {
    setPreparedPhotos([])
    setTakenDateInput('')
    setAcademicYearInput('')
    setTakenDateError(null)
    setCropTotal(photos.length)
    setCroppedFiles([])
    setPendingPhotos(photos)
  }

  const handleFiles = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? [])
    if (inputRef.current) inputRef.current.value = ''
    if (files.length === 0) return

    setUploadStage('reading')
    setProcessingFiles(files.map((file) => file.name))
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

    setUploadStage('checking')
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    const validationErrors = files.map(validatePhotoFile).filter((error): error is string => Boolean(error))
    const validFiles = files.filter((file) => !validatePhotoFile(file))
    setFeedback(validationErrors.length > 0 ? { kind: 'error', text: validationErrors.join(' ') } : null)
    if (validFiles.length === 0) {
      setUploadStage('idle')
      setProcessingFiles([])
      return
    }

    setProcessingFiles(validFiles.map((file) => file.name))
    const inspected: PendingPhoto[] = []
    try {
      setUploadStage('processing')
      for (const file of validFiles) inspected.push(await inspectPhoto(file))
      setCropTotal(inspected.length)
      if (inspected.some((photo) => !photo.takenAt || !photo.academicYear)) {
        setPreparedPhotos(inspected)
        setTakenDateInput('')
        setAcademicYearInput('')
        setTakenDateError(null)
      } else {
        beginCropping(inspected)
      }
    } catch (error) {
      inspected.forEach((photo) => URL.revokeObjectURL(photo.imageSrc))
      void error
      setUploadStage('idle')
      setFeedback({ kind: 'error', text: '这张照片暂时无法整理，请重新选择一张。' })
    } finally {
      setProcessingFiles([])
    }
  }

  const missingMetadataIndex = preparedPhotos.findIndex((photo) => !photo.takenAt || !photo.academicYear)
  const photoAwaitingMetadata = missingMetadataIndex >= 0 ? preparedPhotos[missingMetadataIndex] : null

  const confirmTakenDate = () => {
    if (!isValidTakenAt(takenDateInput)) {
      setTakenDateError('请选择有效的拍摄日期。')
      return
    }
    if (!academicYearInput) {
      setTakenDateError('请选择这张照片所属的大学阶段。')
      return
    }
    if (!photoAwaitingMetadata) return

    const updatedPhotos = preparedPhotos.map((photo, index) => (
      index === missingMetadataIndex
        ? { ...photo, takenAt: takenDateInput, academicYear: academicYearInput }
        : photo
    ))
    setTakenDateInput('')
    setAcademicYearInput('')
    setTakenDateError(null)
    if (updatedPhotos.some((photo) => !photo.takenAt || !photo.academicYear)) {
      setPreparedPhotos(updatedPhotos)
    } else {
      beginCropping(updatedPhotos)
    }
  }

  const cancelTakenDate = () => {
    if (!photoAwaitingMetadata) return
    URL.revokeObjectURL(photoAwaitingMetadata.imageSrc)
    const remainingPhotos = preparedPhotos.filter((_, index) => index !== missingMetadataIndex)
    setTakenDateInput('')
    setAcademicYearInput('')
    setTakenDateError(null)

    if (remainingPhotos.length === 0) {
      setPreparedPhotos([])
      setUploadStage('idle')
      setFeedback({ kind: 'info', text: '已取消这张照片，原始照片没有被保存。' })
    } else if (remainingPhotos.some((photo) => !photo.takenAt || !photo.academicYear)) {
      setPreparedPhotos(remainingPhotos)
    } else {
      beginCropping(remainingPhotos)
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
    if (currentPhoto?.takenAt) rememberTakenAt(file, currentPhoto.takenAt)
    if (currentPhoto?.academicYear) rememberAcademicYear(file, currentPhoto.academicYear)
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
  const schemaBlocksUpload = academicYearSchemaStatus !== 'ready'
  const schemaMessage = academicYearSchemaStatus === 'missing'
    ? '共同相册尚未启用 academic_year 字段。请在 Supabase SQL Editor 执行 supabase/add_academic_year.sql。为避免大学阶段选择丢失，上传已暂停。'
    : academicYearSchemaStatus === 'unavailable'
      ? '暂时无法确认共同相册的数据库结构。为保护照片归档信息，上传已暂停，请稍后刷新重试。'
      : academicYearSchemaStatus === 'checking'
        ? '正在确认共同相册的数据库结构…'
        : null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="photo-manager"
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/30 p-0 backdrop-blur-md sm:items-center sm:p-6 dark:bg-black/58"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: appleEaseOut }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !photoPendingDeletion && processingFiles.length === 0 && pendingPhotos.length === 0 && preparedPhotos.length === 0) onClose()
          }}
          role="presentation"
          data-dialog-layer="true"
        >
          <motion.section
            ref={managerDialogRef}
            className="apple-modal-shell flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden !rounded-b-none !rounded-t-[30px] sm:max-h-[88dvh] sm:!rounded-[30px]"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(22px) scale(0.985)' }}
            animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(16px) scale(0.99)' }}
            transition={{ duration: 0.28, ease: appleEaseOut }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="photo-manager-title"
            tabIndex={-1}
            data-motion-transform="true"
          >
            <span className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-[var(--separator-strong)] sm:hidden" aria-hidden="true" />
            <header className="flex items-start justify-between px-5 pb-5 pt-4 sm:px-7 sm:pb-5 sm:pt-7">
              <div>
                <h2 id="photo-manager-title" className="text-xl font-semibold tracking-[-0.035em] sm:text-2xl">共同相册 · 留下新的回忆</h2>
                <p className="apple-secondary-text mt-1.5 text-xs">上传、整理，或者带走不再需要的照片。</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={processingFiles.length > 0 || pendingPhotos.length > 0 || preparedPhotos.length > 0 || Boolean(photoPendingDeletion)}
                className="apple-toolbar-button disabled:cursor-wait disabled:opacity-40"
                aria-label="关闭照片管理"
              >
                <svg className="size-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" /></svg>
              </button>
            </header>

            <div className="photo-manager-scroll overflow-y-auto px-5 pb-6 pt-2 sm:px-7 sm:pb-7 sm:pt-3">
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

              <AnimatePresence initial={false}>
                {schemaMessage && (
                  <motion.div
                    key={academicYearSchemaStatus}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(5px)' }}
                    animate={{ opacity: 1, transform: 'translateY(0px)' }}
                    exit={{ opacity: 0, transform: reduceMotion ? 'none' : 'translateY(-3px)' }}
                    transition={{ duration: 0.22, ease: appleEaseOut }}
                    className={`mb-4 rounded-[18px] px-4 py-3.5 text-[11px] leading-5 ${academicYearSchemaStatus === 'missing' ? 'bg-amber-500/[0.1] text-amber-900 dark:text-amber-100' : 'liquid-glass-surface text-[var(--text-secondary)]'}`}
                    role={academicYearSchemaStatus === 'missing' ? 'alert' : 'status'}
                    data-motion-transform="true"
                  >
                    <p className="font-semibold">{academicYearSchemaStatus === 'missing' ? '需要完成一次数据库迁移' : '正在保护照片归档信息'}</p>
                    <p className="mt-1 text-[10px] opacity-80">{schemaMessage}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="button"
                onClick={choosePhotos}
                disabled={isLoading || schemaBlocksUpload || processingFiles.length > 0 || pendingPhotos.length > 0 || preparedPhotos.length > 0 || Boolean(storageError)}
                className="photo-upload-target liquid-glass-surface flex min-h-24 w-full items-center justify-between rounded-[22px] px-5 py-5 text-left disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:py-6"
              >
                <span>
                  <span className="block text-sm font-semibold tracking-[-0.01em]">选择照片</span>
                  <span className="apple-tertiary-text mt-1.5 block text-xs">{isLoading ? '正在取回共同回忆…' : schemaBlocksUpload ? '需要先确认共同相册配置' : '自动识别 3:4、16:9、1:1 · 单张不超过 10 MB'}</span>
                </span>
                <span className="grid size-11 place-items-center rounded-full bg-[var(--page-fg)] text-[var(--page-bg)] shadow-sm" aria-hidden="true">
                  <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                </span>
              </button>

              <AnimatePresence initial={false}>
                {uploadStage !== 'idle' && (
                  <MemorySaveProgress
                    stage={uploadStage}
                    count={uploadStage === 'success' ? completedUploadCount : Math.max(processingFiles.length, cropTotal, 1)}
                  />
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {(feedback || storageError) && (
                  <motion.p
                    key={storageError ?? `${feedback?.kind}-${feedback?.text}`}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(5px) scale(0.99)' }}
                    animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(-3px) scale(0.99)' }}
                    transition={feedback?.kind === 'removed' ? appleSpring : { duration: 0.22, ease: appleEaseOut }}
                    className={`mt-4 rounded-xl px-4 py-3 text-xs leading-5 ${storageError || feedback?.kind === 'error'
                      ? 'bg-amber-500/[0.08] text-amber-800 dark:text-amber-200'
                      : 'bg-[var(--surface-muted)] text-[var(--text-secondary)]'}`}
                    role="status"
                    aria-live="polite"
                    data-motion-transform="true"
                  >
                    {storageError ?? feedback?.text}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="mb-4 mt-9 flex items-end justify-between">
                <div>
                  <h3 className="text-sm font-semibold">已经留下的回忆</h3>
                  <p className="apple-tertiary-text mt-1 text-[11px]">每一次上传，都会与来到这里的人共享。</p>
                </div>
                <span className="apple-tertiary-text text-[11px] tabular-nums">{String(photos.length).padStart(2, '0')}</span>
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
                    {photos.map((photo, photoIndex) => {
                      const deleting = deletingIds.includes(photo.id)
                      return (
                        <motion.div
                          key={photo.id}
                          layout
                          initial={{ opacity: 0, transform: reduceMotion ? 'none' : 'scale(0.96)' }}
                          animate={{ opacity: deleting ? 0.45 : 1, transform: 'scale(1)' }}
                          exit={{ opacity: 0, transform: reduceMotion ? 'none' : 'scale(0.96)' }}
                          className="group relative aspect-[3/4] overflow-hidden rounded-[15px] bg-[var(--surface-muted)] shadow-[var(--shadow-small)]"
                          data-motion-transform="true"
                        >
                          <img src={photo.src} alt="共同相册中的照片" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => requestPhotoDeletion(photo)}
                            disabled={deleting}
                            className="absolute right-1.5 top-1.5 grid size-11 place-items-center rounded-full bg-black/48 text-white shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.26)] backdrop-blur-xl transition-colors duration-[180ms] hover:bg-black/70 disabled:cursor-wait sm:size-9"
                            aria-label={`删除共同相册中的第 ${photoIndex + 1} 张照片`}
                          >
                            {deleting ? '·' : <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" /></svg>}
                          </button>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="rounded-[20px] bg-[var(--surface-muted)] px-5 py-9 text-center">
                  <p className="apple-secondary-text text-sm leading-6">这里还没有共同回忆，<br />上传第一张照片吧。</p>
                  <button
                    type="button"
                    onClick={choosePhotos}
                    disabled={Boolean(storageError) || schemaBlocksUpload}
                    className="apple-primary-button mt-5 !min-h-11 !px-5 !text-xs disabled:opacity-40"
                  >
                    上传第一张照片
                  </button>
                </div>
              )}

              <p className="apple-tertiary-text mt-6 text-[10px] leading-5">
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
          aspectPreset={pendingPhotos[0].aspectPreset}
          onCancel={cancelCropping}
          onConfirm={confirmCroppedPhoto}
        />
      )}
      <TakenDateModal
        isOpen={isOpen && Boolean(photoAwaitingMetadata)}
        filename={photoAwaitingMetadata?.file.name ?? ''}
        value={takenDateInput}
        academicYear={academicYearInput}
        error={takenDateError}
        onChange={(value) => {
          setTakenDateInput(value)
          setTakenDateError(null)
        }}
        onAcademicYearChange={(value) => {
          setAcademicYearInput(value)
          setTakenDateError(null)
        }}
        onCancel={cancelTakenDate}
        onConfirm={confirmTakenDate}
      />
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
