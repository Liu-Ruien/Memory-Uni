import { motion, useReducedMotion } from 'framer-motion'
import { academicYears, type AcademicYear, type AcademicYearId } from '../data/academicYears'
import type { Photo } from '../data/photos'
import { appleEaseOut, appleSpring } from '../design/motion'

const heroPhotoSrc = '/images/photo-together.jpg'

interface LandingPhotoGroup {
  year: AcademicYear
  photos: Photo[]
}

interface LandingPageProps {
  photos: Photo[]
  photoGroups: LandingPhotoGroup[]
  isLoading: boolean
  onOpenPhotoManager: () => void
  onSelectYear: (yearId: AcademicYearId) => void
}

const previewPositions = ['proof-preview-one', 'proof-preview-two', 'proof-preview-three']
const relayAccents = ['relay-cobalt', 'relay-neutral', 'relay-amber', 'relay-oxblood']

export function LandingPage({
  photos,
  photoGroups,
  isLoading,
  onOpenPhotoManager,
  onSelectYear,
}: LandingPageProps) {
  const reduceMotion = useReducedMotion()
  const previewPhotos = photos.slice(0, previewPositions.length)
  const countsByYear = new Map(photoGroups.map(({ year, photos: yearPhotos }) => [year.id, yearPhotos.length]))

  return (
    <section id="home" className="proof-hero" aria-labelledby="landing-title">
      <div className="proof-hero-inner">
        <svg className="proof-path-field" viewBox="0 0 1440 760" preserveAspectRatio="none" aria-hidden="true">
          <motion.path
            d="M430 182 C560 182 500 330 676 330"
            initial={{ pathLength: reduceMotion ? 1 : 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.56 }}
            transition={{ duration: reduceMotion ? 0.18 : 0.85, delay: reduceMotion ? 0 : 0.22, ease: appleEaseOut }}
          />
          <motion.path
            d="M462 508 C610 508 570 404 726 404"
            initial={{ pathLength: reduceMotion ? 1 : 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.42 }}
            transition={{ duration: reduceMotion ? 0.18 : 0.9, delay: reduceMotion ? 0 : 0.3, ease: appleEaseOut }}
          />
          <motion.path
            className="is-oxblood"
            d="M1040 602 C1125 640 1180 660 1260 694"
            initial={{ pathLength: reduceMotion ? 1 : 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.48 }}
            transition={{ duration: reduceMotion ? 0.18 : 0.75, delay: reduceMotion ? 0 : 0.42, ease: appleEaseOut }}
          />
        </svg>

        <div className="proof-hero-grid">
          <motion.div
            className="proof-hero-copy"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(16px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: reduceMotion ? 0.18 : 0.55, ease: appleEaseOut }}
            data-motion-transform="true"
          >
            <h1 id="landing-title" className="proof-display-title">
              把我们散落的照片，
              <br />
              补成同一段四年。
            </h1>
            <p className="proof-hero-description">
              每个人手机里都留着不同的一角。
              <br className="hidden sm:block" />
              把它放回来，我们才拥有完整的共同回忆。
            </p>

            <div className="proof-upload-row">
              <motion.button
                type="button"
                onClick={onOpenPhotoManager}
                className="proof-upload-button"
                whileTap={reduceMotion ? { opacity: 0.82 } : { scale: 0.97 }}
                transition={appleSpring}
                data-motion-transform="true"
              >
                <span>补上一张照片</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </motion.button>
              <p className="proof-upload-note">无需登录 · JPG / PNG / WebP · 单张不超过 10 MB</p>
            </div>
          </motion.div>

          <motion.figure
            className="proof-photo-stage"
            initial={reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, transform: 'translateY(18px) scale(0.985)', filter: 'blur(7px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px) scale(1)', filter: 'blur(0px)' }}
            transition={{ ...appleSpring, delay: reduceMotion ? 0 : 0.08 }}
            data-motion-transform="true"
          >
            <div className="proof-photo-window">
              <span className="proof-album-page-stack" aria-hidden="true" />
              <div className="proof-album-page">
                <span className="proof-glass-skin" aria-hidden="true" />
                <img
                  src={heroPhotoSrc}
                  alt="朋友们在校园里留下的毕业合照"
                  className="proof-hero-photo"
                  fetchPriority="high"
                  decoding="async"
                />
                <span className="proof-album-emboss" aria-hidden="true">MEMORY UNI · 2022—2026</span>
                <span className="registration-cross is-top-left" aria-hidden="true" />
                <span className="registration-cross is-top-right" aria-hidden="true" />
                <span className="registration-cross is-bottom-left" aria-hidden="true" />
                <span className="registration-cross is-bottom-right" aria-hidden="true" />
              </div>
            </div>

            <div className="proof-preview-field" aria-label={isLoading ? '共同照片正在加载' : `${photos.length} 张照片正在共同补全`}>
              {previewPositions.map((positionClass, index) => {
                const photo = previewPhotos[index]
                return (
                  <motion.span
                    key={photo?.id ?? positionClass}
                    className={`proof-preview-pane ${positionClass}${photo ? '' : ' is-empty'}${isLoading ? ' is-loading' : ''}`}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(12px) scale(0.97)' }}
                    animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
                    transition={{ duration: reduceMotion ? 0.18 : 0.46, delay: reduceMotion ? 0 : 0.17 + index * 0.06, ease: appleEaseOut }}
                    data-motion-transform="true"
                    aria-hidden="true"
                  >
                    {photo && <img src={photo.src} alt="" loading="eager" decoding="async" draggable={false} />}
                    <span className="proof-preview-glass" />
                    <span className="registration-cross is-top-left" />
                    <span className="proof-preview-index">{String(index + 1).padStart(2, '0')}</span>
                  </motion.span>
                )
              })}
            </div>

            <figcaption className="proof-photo-caption">
              <span>毕业合照</span>
              <span>临沂大学 · 2026</span>
            </figcaption>
          </motion.figure>
        </div>

        <nav className="memory-relay" aria-label="按学年浏览照片并进入 Memory Film">
          <span className="memory-relay-start" aria-hidden="true" />
          {academicYears.map((year, index) => {
            const count = countsByYear.get(year.id) ?? 0
            const countLabel = isLoading ? '··' : String(count).padStart(2, '0')
            return (
              <button
                key={year.id}
                type="button"
                onClick={() => onSelectYear(year.id)}
                className={`memory-relay-stop ${relayAccents[index]}`}
                aria-label={`浏览${year.title}，${isLoading ? '照片正在加载' : `共 ${count} 张照片`}`}
              >
                <span className="memory-relay-node" aria-hidden="true" />
                <span className="memory-relay-year">{year.title.split(' · ')[0]}</span>
                <span className="memory-relay-count tabular-nums">{countLabel}</span>
              </button>
            )
          })}
          <a href="/memory-film" className="memory-relay-film" aria-label="进入 Memory Film 观看完整回忆">
            <span>
              <strong>MEMORY FILM</strong>
              <small>观看完整回忆</small>
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M14 7l5 5-5 5" />
            </svg>
          </a>
        </nav>

        <a href="#memory-section" className="proof-next-chapter">
          <span>沿着四年继续浏览</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M7.5 14.5 12 19l4.5-4.5" />
          </svg>
        </a>
      </div>
    </section>
  )
}
