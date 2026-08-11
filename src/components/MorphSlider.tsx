import { gsap } from 'gsap'
import { Mesh, Program, Renderer, Texture, Triangle, type OGLRenderingContext } from 'ogl'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import './MorphSlider.css'

export interface MorphSliderItem {
  image: string
  alt: string
  caption?: string
}

interface MorphSliderProps {
  items: MorphSliderItem[]
  startIndex?: number
  transition?: 'melt' | 'ripple'
  duration?: number
  intensity?: number
  aberration?: number
  drift?: number
  radius?: number
  showControls?: boolean
  onIndexChange?: (index: number) => void
  onClose?: () => void
}

export interface MorphSliderHandle {
  next: () => void
  previous: () => void
  goTo: (index: number) => void
  refreshSize: () => void
}

interface MorphEngine {
  next: () => void
  previous: () => void
  goTo: (index: number) => void
  setPointer: (x: number, y: number) => void
  beginDrag: () => boolean
  drag: (distance: number) => void
  endDrag: () => void
  resize: () => void
  destroy: () => void
}

interface EngineOptions {
  transition: 'melt' | 'ripple'
  duration: number
  intensity: number
  aberration: number
  drift: number
}

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragmentShader = `
precision highp float;

uniform sampler2D tCurrent;
uniform sampler2D tNext;
uniform vec2 uResolution;
uniform vec2 uCurrentSize;
uniform vec2 uNextSize;
uniform float uProgress;
uniform float uDir;
uniform int uMode;
uniform float uIntensity;
uniform float uAberration;
uniform float uDrift;
uniform float uTime;
uniform float uReduce;
uniform vec2 uPointer;

varying vec2 vUv;

const float PI = 3.14159265359;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

vec4 containSample(sampler2D textureMap, vec2 uv, vec2 resolution, vec2 imageSize, float chroma) {
  float viewAspect = resolution.x / max(resolution.y, 1.0);
  float imageAspect = imageSize.x / max(imageSize.y, 1.0);
  vec2 sampleUv = uv;

  if (viewAspect > imageAspect) {
    float visibleWidth = imageAspect / max(viewAspect, 0.0001);
    sampleUv.x = (uv.x - (0.5 - visibleWidth * 0.5)) / max(visibleWidth, 0.0001);
  } else {
    float visibleHeight = viewAspect / max(imageAspect, 0.0001);
    sampleUv.y = (uv.y - (0.5 - visibleHeight * 0.5)) / max(visibleHeight, 0.0001);
  }

  float mask = step(0.0, sampleUv.x) * step(sampleUv.x, 1.0)
    * step(0.0, sampleUv.y) * step(sampleUv.y, 1.0);
  vec3 color = vec3(
    texture2D(textureMap, sampleUv + vec2(chroma, 0.0)).r,
    texture2D(textureMap, sampleUv).g,
    texture2D(textureMap, sampleUv - vec2(chroma, 0.0)).b
  );
  return vec4(color * mask, mask);
}

void main() {
  float progress = clamp(uProgress, 0.0, 1.0);
  float envelope = sin(progress * PI);
  vec2 uv = vUv;

  uv += vec2(
    sin(uTime * 0.25 + uv.y * 4.0),
    cos(uTime * 0.22 + uv.x * 4.0)
  ) * uDrift * 0.006;

  vec2 currentUv = uv;
  vec2 nextUv = uv;
  float blend = smoothstep(0.0, 1.0, progress);

  if (uReduce < 0.5) {
    if (uMode == 1) {
      float distanceFromPointer = distance(uv, uPointer);
      float ring = progress * 1.6;
      float wave = sin((distanceFromPointer - ring) * 30.0) * envelope;
      vec2 direction = normalize(uv - uPointer + 0.0001);
      vec2 displacement = direction * wave * uIntensity * 0.22;
      currentUv = uv + displacement;
      nextUv = uv + displacement * 0.55;
      blend = 1.0 - smoothstep(ring - 0.03, ring + 0.03, distanceFromPointer);
    } else {
      float field = fbm(uv * 2.4 + uTime * 0.03);
      float warp = fbm(uv * 4.1 - uTime * 0.02);
      vec2 displacement = vec2(field, warp) - 0.5;
      currentUv = uv + displacement * uIntensity * 0.45 * progress;
      nextUv = uv - displacement * uIntensity * 0.45 * (1.0 - progress);
      blend = smoothstep(field - 0.15, field + 0.15, progress);
    }
  }

  float chroma = uReduce < 0.5 ? uAberration * envelope * 0.026 : 0.0;
  vec4 currentSample = containSample(tCurrent, currentUv, uResolution, uCurrentSize, chroma);
  vec4 nextSample = containSample(tNext, nextUv, uResolution, uNextSize, chroma);
  vec3 background = vec3(0.025, 0.025, 0.029);
  vec3 currentColor = mix(background, currentSample.rgb, currentSample.a);
  vec3 nextColor = mix(background, nextSample.rgb, nextSample.a);
  vec3 color = mix(currentColor, nextColor, blend);
  float vignette = smoothstep(1.2, 0.2, length(uv - 0.5));
  color *= mix(0.72, 1.0, vignette);
  gl_FragColor = vec4(color, 1.0);
}
`

function createFallbackTexture(gl: OGLRenderingContext) {
  const size = 4
  const data = new Uint8Array(size * size * 4)
  for (let index = 0; index < size * size; index += 1) {
    data[index * 4] = 16
    data[index * 4 + 1] = 16
    data[index * 4 + 2] = 18
    data[index * 4 + 3] = 255
  }
  return new Texture(gl, { image: data, width: size, height: size, generateMipmaps: false })
}

function createMorphEngine(
  container: HTMLDivElement,
  items: MorphSliderItem[],
  startIndex: number,
  reducedMotion: boolean,
  options: EngineOptions,
  onIndexChange: (index: number) => void,
  onReady: () => void,
): MorphEngine {
  const renderer = new Renderer({
    alpha: false,
    antialias: true,
    dpr: Math.min(window.devicePixelRatio || 1, 1.75),
  })
  const gl = renderer.gl
  gl.clearColor(0.04, 0.04, 0.045, 1)

  const canvas = gl.canvas as HTMLCanvasElement
  canvas.className = 'morph-slider-canvas'
  container.appendChild(canvas)

  const geometry = new Triangle(gl)
  const textures = items.map(() => createFallbackTexture(gl))
  const sizes: [number, number][] = items.map(() => [1, 1])
  const currentTexture = { value: textures[startIndex] }
  const nextTexture = { value: textures[startIndex] }
  const currentSize = { value: sizes[startIndex] }
  const nextSize = { value: sizes[startIndex] }
  const progress = { value: 0 }
  const direction = { value: 1 }
  const pointer = { value: [0.5, 0.5] }
  const resolution = { value: [1, 1] }

  const program = new Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    uniforms: {
      tCurrent: currentTexture,
      tNext: nextTexture,
      uResolution: resolution,
      uCurrentSize: currentSize,
      uNextSize: nextSize,
      uProgress: progress,
      uDir: direction,
      uMode: { value: options.transition === 'ripple' ? 1 : 0 },
      uIntensity: { value: options.intensity },
      uAberration: { value: options.aberration },
      uDrift: { value: options.drift },
      uTime: { value: 0 },
      uReduce: { value: reducedMotion ? 1 : 0 },
      uPointer: pointer,
    },
  })
  const mesh = new Mesh(gl, { geometry, program })

  let currentIndex = startIndex
  let pendingIndex = startIndex
  let shownIndex = startIndex
  let animating = false
  let dragging = false
  let dragDirection = 0
  let tween: gsap.core.Tween | null = null
  let frame = 0
  let currentReady = false

  const wrap = (index: number) => ((index % items.length) + items.length) % items.length
  const announce = (index: number) => {
    if (shownIndex === index) return
    shownIndex = index
    onIndexChange(index)
  }

  items.forEach((item, index) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.decoding = 'async'
    image.src = item.image
    image.onload = () => {
      const texture = new Texture(gl, { generateMipmaps: false })
      texture.image = image
      textures[index] = texture
      sizes[index] = [image.naturalWidth || 1, image.naturalHeight || 1]

      if (index === currentIndex) {
        currentTexture.value = texture
        currentSize.value = sizes[index]
      }
      if (index === pendingIndex) {
        nextTexture.value = texture
        nextSize.value = sizes[index]
      }
      if (index === startIndex && !currentReady) {
        currentReady = true
        onReady()
      }
    }
  })

  const resize = () => {
    renderer.setSize(Math.max(container.clientWidth, 1), Math.max(container.clientHeight, 1))
    resolution.value = [canvas.width, canvas.height]
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)
  resize()

  const render = (time: number) => {
    program.uniforms.uTime.value = time * 0.001
    renderer.render({ scene: mesh })
    frame = window.requestAnimationFrame(render)
  }
  frame = window.requestAnimationFrame(render)

  const prepare = (targetIndex: number, nextDirection: number) => {
    pendingIndex = targetIndex
    currentTexture.value = textures[currentIndex]
    currentSize.value = sizes[currentIndex]
    nextTexture.value = textures[targetIndex]
    nextSize.value = sizes[targetIndex]
    direction.value = nextDirection
  }

  const commit = (targetIndex: number) => {
    currentIndex = targetIndex
    pendingIndex = targetIndex
    currentTexture.value = textures[targetIndex]
    currentSize.value = sizes[targetIndex]
    progress.value = 0
    animating = false
    tween = null
    announce(targetIndex)
  }

  const goTo = (rawIndex: number) => {
    if (animating || dragging || items.length < 2) return
    const targetIndex = wrap(rawIndex)
    if (targetIndex === currentIndex) return
    const nextDirection = rawIndex > currentIndex || (currentIndex === items.length - 1 && targetIndex === 0) ? 1 : -1
    prepare(targetIndex, nextDirection)
    animating = true
    announce(targetIndex)
    tween = gsap.fromTo(
      progress,
      { value: 0 },
      {
        value: 1,
        duration: reducedMotion ? Math.min(options.duration, 0.32) : options.duration,
        ease: 'power2.inOut',
        onComplete: () => commit(targetIndex),
      },
    )
  }

  const beginDrag = () => {
    if (animating || items.length < 2) return false
    dragging = true
    dragDirection = 0
    return true
  }

  const drag = (distance: number) => {
    if (!dragging) return
    const nextDirection = distance < 0 ? 1 : -1
    if (nextDirection !== dragDirection) {
      dragDirection = nextDirection
      prepare(wrap(currentIndex + nextDirection), nextDirection)
    }
    const dragProgress = Math.min(Math.abs(distance), 1)
    progress.value = dragProgress
    announce(dragProgress > 0.42 ? wrap(currentIndex + nextDirection) : currentIndex)
  }

  const endDrag = () => {
    if (!dragging) return
    dragging = false
    if (dragDirection === 0) return
    const targetIndex = wrap(currentIndex + dragDirection)
    const shouldCommit = progress.value > 0.34
    animating = true
    announce(shouldCommit ? targetIndex : currentIndex)
    tween = gsap.to(progress, {
      value: shouldCommit ? 1 : 0,
      duration: reducedMotion ? 0.2 : 0.48,
      ease: 'power2.out',
      onComplete: () => {
        if (shouldCommit) {
          commit(targetIndex)
        } else {
          animating = false
          tween = null
        }
      },
    })
  }

  const handleContextLost = (event: Event) => {
    event.preventDefault()
    window.cancelAnimationFrame(frame)
  }
  canvas.addEventListener('webglcontextlost', handleContextLost)

  return {
    next: () => goTo(currentIndex + 1),
    previous: () => goTo(currentIndex - 1),
    goTo,
    setPointer: (x, y) => {
      pointer.value = [x, y]
    },
    beginDrag,
    drag,
    endDrag,
    resize,
    destroy: () => {
      window.cancelAnimationFrame(frame)
      tween?.kill()
      resizeObserver.disconnect()
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      textures.forEach((texture) => {
        if (texture.texture) gl.deleteTexture(texture.texture)
      })
      if (program.program) gl.deleteProgram(program.program)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      canvas.remove()
    },
  }
}

export const MorphSlider = forwardRef<MorphSliderHandle, MorphSliderProps>(function MorphSlider({
  items,
  startIndex = 0,
  transition = 'melt',
  duration = 1.05,
  intensity = 0.5,
  aberration = 0.24,
  drift = 0.25,
  radius = 18,
  showControls = true,
  onIndexChange,
  onClose,
}, ref) {
  const stageRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<MorphEngine | null>(null)
  const initialIndexRef = useRef(startIndex)
  const dragStartRef = useRef(0)
  const dragDistanceRef = useRef(0)
  const dragActiveRef = useRef(false)
  const [index, setIndex] = useState(Math.min(startIndex, Math.max(items.length - 1, 0)))
  const [engineReady, setEngineReady] = useState(false)
  const [webglFailed, setWebglFailed] = useState(false)

  const options = useMemo<EngineOptions>(
    () => ({ transition, duration, intensity, aberration, drift }),
    [aberration, drift, duration, intensity, transition],
  )

  const changeIndex = useCallback((nextIndex: number) => {
    setIndex(nextIndex)
    onIndexChange?.(nextIndex)
  }, [onIndexChange])

  const fallbackGoTo = useCallback((rawIndex: number) => {
    if (items.length < 2) return
    const nextIndex = ((rawIndex % items.length) + items.length) % items.length
    changeIndex(nextIndex)
  }, [changeIndex, items.length])

  const next = useCallback(() => {
    if (engineRef.current) engineRef.current.next()
    else fallbackGoTo(index + 1)
  }, [fallbackGoTo, index])

  const previous = useCallback(() => {
    if (engineRef.current) engineRef.current.previous()
    else fallbackGoTo(index - 1)
  }, [fallbackGoTo, index])

  const goTo = useCallback((itemIndex: number) => {
    if (engineRef.current) engineRef.current.goTo(itemIndex)
    else fallbackGoTo(itemIndex)
  }, [fallbackGoTo])

  useImperativeHandle(ref, () => ({
    next,
    previous,
    goTo,
    refreshSize: () => engineRef.current?.resize(),
  }), [goTo, next, previous])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage || items.length === 0) return
    const initialIndex = Math.min(initialIndexRef.current, items.length - 1)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    try {
      engineRef.current = createMorphEngine(
        stage,
        items,
        initialIndex,
        reducedMotion,
        options,
        changeIndex,
        () => setEngineReady(true),
      )
    } catch {
      setWebglFailed(true)
    }

    return () => {
      engineRef.current?.destroy()
      engineRef.current = null
    }
  }, [changeIndex, items, options])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.()
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        next()
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        previous()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [next, onClose, previous])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    dragStartRef.current = event.clientX
    dragDistanceRef.current = 0
    engineRef.current?.setPointer(
      (event.clientX - bounds.left) / Math.max(bounds.width, 1),
      1 - (event.clientY - bounds.top) / Math.max(bounds.height, 1),
    )
    dragActiveRef.current = engineRef.current?.beginDrag() ?? webglFailed
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId)
    } catch {
      // Pointer capture is optional; dragActiveRef keeps swipe reliable without it.
    }
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragActiveRef.current) return
    const distance = event.clientX - dragStartRef.current
    dragDistanceRef.current = distance
    engineRef.current?.drag(distance / Math.max(event.currentTarget.clientWidth, 1))
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragActiveRef.current) return
    dragActiveRef.current = false
    if (engineRef.current) {
      engineRef.current.endDrag()
    } else if (Math.abs(dragDistanceRef.current) > 55) {
      fallbackGoTo(index + (dragDistanceRef.current < 0 ? 1 : -1))
    }
    try {
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture?.(event.pointerId)
      }
    } catch {
      // The pointer may already have been released by the browser.
    }
  }

  if (items.length === 0) return null

  const style = {
    borderRadius: `${radius}px`,
    '--morph-duration': `${duration}s`,
  } as CSSProperties

  return (
    <div className="morph-slider" style={style}>
      <div
        ref={stageRef}
        className="morph-slider-stage"
        role="group"
        aria-roledescription="轮播"
        aria-label="沉浸式照片浏览"
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />

      <img
        key={`fallback-${items[index].image}`}
        src={items[index].image}
        alt={items[index].alt}
        className={`morph-slider-fallback ${engineReady && !webglFailed ? 'is-hidden' : ''}`}
        draggable={false}
      />

      {showControls && (
        <>
          <div className="morph-slider-controls">
            <button type="button" className="morph-slider-button" onClick={previous} aria-label="上一张照片">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m14.5 6-6 6 6 6" />
              </svg>
            </button>
            <button type="button" className="morph-slider-button" onClick={next} aria-label="下一张照片">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9.5 6 6 6-6 6" />
              </svg>
            </button>
          </div>

          <div className="morph-slider-indicators" role="tablist" aria-label="照片列表">
            {items.map((item, itemIndex) => (
              <button
                key={item.image}
                type="button"
                role="tab"
                aria-selected={itemIndex === index}
                aria-label={`查看第 ${itemIndex + 1} 张照片`}
                className={`morph-slider-dot ${itemIndex === index ? 'is-active' : ''}`}
                onClick={() => goTo(itemIndex)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
})
