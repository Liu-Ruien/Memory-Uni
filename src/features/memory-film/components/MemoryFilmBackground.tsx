import { useEffect, useRef } from 'react'

export type FilmAtmosphereScene =
  | 'intro'
  | 'photo-wall'
  | 'controlled-scatter'
  | 'horizontal-stream'
  | 'memory-ring'
  | 'memory-tunnel'
  | 'final-gathering'
  | 'film-text'

interface MemoryFilmBackgroundProps {
  scene: FilmAtmosphereScene
}

interface Particle {
  x: number
  y: number
  radius: number
  alpha: number
  phase: number
  speed: number
  depth: number
}

interface AtmosphereField {
  x: number
  y: number
  radial: number
  orbit: number
  energy: number
}

function deterministicUnit(index: number, salt: number) {
  const value = Math.sin((index + 1) * 19.197 + salt * 71.371) * 24137.154
  return value - Math.floor(value)
}

function sceneEnergy(scene: FilmAtmosphereScene) {
  if (scene === 'memory-ring') return 1
  if (scene === 'memory-tunnel') return 0.82
  if (scene === 'horizontal-stream') return 0.62
  if (scene === 'controlled-scatter') return 0.48
  if (scene === 'final-gathering') return 0.32
  if (scene === 'film-text') return 0.12
  return 0.24
}

function sceneField(scene: FilmAtmosphereScene): AtmosphereField {
  const energy = sceneEnergy(scene)
  if (scene === 'horizontal-stream') return { x: -0.0064, y: 0.00012, radial: 0, orbit: 0, energy }
  if (scene === 'memory-ring') return { x: -0.0002, y: 0.00008, radial: 0.0005, orbit: 0.018, energy }
  if (scene === 'memory-tunnel') return { x: 0, y: 0, radial: 0.012, orbit: 0.002, energy }
  if (scene === 'controlled-scatter') return { x: -0.0014, y: 0.0009, radial: 0.0018, orbit: -0.003, energy }
  if (scene === 'final-gathering') return { x: 0, y: 0.00028, radial: -0.0007, orbit: 0, energy }
  if (scene === 'film-text') return { x: 0, y: 0.00012, radial: 0, orbit: 0, energy }
  return { x: -0.00015, y: 0.00075, radial: 0, orbit: 0.001, energy }
}

function damp(current: number, target: number, rate: number, deltaTime: number) {
  return current + (target - current) * (1 - Math.exp(-rate * deltaTime))
}

function wrapUnit(value: number) {
  return ((value % 1) + 1) % 1
}

export function MemoryFilmBackground({ scene }: MemoryFilmBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef(scene)
  sceneRef.current = scene

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.matchMedia('(max-width: 719px)').matches
    const particleCount = mobile ? 30 : 64
    const particles: Particle[] = Array.from({ length: particleCount }, (_, index) => ({
      x: deterministicUnit(index, 1),
      y: deterministicUnit(index, 2),
      radius: 0.65 + deterministicUnit(index, 3) * (index % 5 === 0 ? 2.1 : 1.15),
      alpha: 0.12 + deterministicUnit(index, 4) * 0.42,
      phase: deterministicUnit(index, 5) * Math.PI * 2,
      speed: 0.14 + deterministicUnit(index, 6) * 0.34,
      depth: index % 4 === 0 ? 1 : 0.55,
    }))
    let width = 1
    let height = 1
    let frame = 0
    let startedAt = performance.now()
    let previousFrameAt = startedAt
    const initialField = sceneField(sceneRef.current)
    const currentField: AtmosphereField = { ...initialField }

    const resize = () => {
      width = Math.max(1, window.innerWidth)
      height = Math.max(1, window.innerHeight)
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    const render = (now: number) => {
      context.clearRect(0, 0, width, height)
      const elapsed = (now - startedAt) / 1000
      const deltaTime = Math.min(0.05, Math.max(0, (now - previousFrameAt) / 1000))
      previousFrameAt = now
      const targetField = sceneField(sceneRef.current)
      currentField.x = damp(currentField.x, targetField.x, 1.7, deltaTime)
      currentField.y = damp(currentField.y, targetField.y, 1.7, deltaTime)
      currentField.radial = damp(currentField.radial, targetField.radial, 1.45, deltaTime)
      currentField.orbit = damp(currentField.orbit, targetField.orbit, 1.35, deltaTime)
      currentField.energy = damp(currentField.energy, targetField.energy, 1.8, deltaTime)

      particles.forEach((particle, index) => {
        if (!reducedMotion) {
          const dx = particle.x - 0.5
          const dy = particle.y - 0.5
          const depthSpeed = 0.62 + particle.depth * 0.72
          const velocityX = currentField.x * depthSpeed
            + dx * currentField.radial * depthSpeed
            - dy * currentField.orbit * depthSpeed
          const velocityY = currentField.y * depthSpeed
            + dy * currentField.radial * depthSpeed
            + dx * currentField.orbit * depthSpeed
          particle.x = wrapUnit(particle.x + velocityX * deltaTime)
          particle.y = wrapUnit(particle.y + velocityY * deltaTime)
        }
        const x = particle.x * width
        const y = particle.y * height
        const twinkle = reducedMotion ? 0.72 : 0.58 + Math.sin(elapsed * particle.speed + particle.phase) * 0.32
        const alpha = particle.alpha * twinkle * (0.42 + currentField.energy * 0.72)
        context.beginPath()
        context.fillStyle = index % 11 === 0
          ? `rgba(240, 107, 93, ${alpha * 0.72})`
          : index % 5 === 0
            ? `rgba(158, 219, 203, ${alpha})`
            : `rgba(244, 248, 245, ${alpha})`
        context.arc(x, y, particle.radius * (0.75 + currentField.energy * 0.32), 0, Math.PI * 2)
        context.fill()
      })

      if (!reducedMotion) frame = requestAnimationFrame(render)
    }

    resize()
    startedAt = performance.now()
    render(startedAt)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="memory-film-atmosphere" data-scene={scene} aria-hidden="true">
      <div className="memory-film-atmosphere-glow memory-film-atmosphere-glow--projector" />
      <div className="memory-film-atmosphere-glow memory-film-atmosphere-glow--mint" />
      <div className="memory-film-atmosphere-glow memory-film-atmosphere-glow--coral" />
      <canvas ref={canvasRef} className="memory-film-atmosphere-dust" />
    </div>
  )
}
