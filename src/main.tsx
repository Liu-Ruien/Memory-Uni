import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const isMemoryFilmRoute = /^\/memory-film\/?$/.test(window.location.pathname)
const Page = isMemoryFilmRoute
  ? lazy(() => import('./features/memory-film/MemoryFilmPage'))
  : lazy(() => import('./App'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense
      fallback={(
        <div
          aria-label="正在打开回忆"
          className={isMemoryFilmRoute ? 'memory-film-route-loading' : 'memory-route-loading'}
        />
      )}
    >
      <Page />
    </Suspense>
  </StrictMode>,
)
