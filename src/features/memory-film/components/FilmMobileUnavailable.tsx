import { GlassButton } from '../../../components/ui/GlassButton'
import { filmCopy } from '../config/filmConfig'

interface FilmMobileUnavailableProps {
  onBack: () => void
}

export function FilmMobileUnavailable({ onBack }: FilmMobileUnavailableProps) {
  return (
    <main className="memory-film-mobile-unavailable">
      <header>
        <p>Memory Uni · Memory Film</p>
        <span>{filmCopy.period}</span>
      </header>

      <div className="memory-film-mobile-device" aria-hidden="true">
        <div className="memory-film-mobile-device-screen">
          <img src="/images/photo-together.jpg" alt="" />
          <div className="memory-film-mobile-device-track"><i /><i /><i /><i /><i /></div>
        </div>
        <div className="memory-film-mobile-device-stand" />
      </div>

      <section className="memory-film-mobile-unavailable-copy" aria-labelledby="mobile-film-unavailable-title">
        <h1 id="mobile-film-unavailable-title">这段回忆，<br />留给大一点的屏幕。</h1>
        <p>Memory Film 会让照片在空间里重新排列，并配合音乐全屏播放。为了保留完整的画面和节奏，请使用电脑浏览器观看。</p>
        <p className="memory-film-mobile-availability"><span aria-hidden="true" />电脑端可用 · 建议佩戴耳机</p>
      </section>

      <GlassButton className="memory-film-action memory-film-mobile-back" href="/" onClick={onBack} ariaLabel="返回四年相册">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <path d="M19 12H5m6-6-6 6 6 6" />
        </svg>
        <span>返回四年相册</span>
      </GlassButton>
    </main>
  )
}
