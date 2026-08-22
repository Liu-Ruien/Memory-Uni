export interface SceneVisualScale {
  wallWidth: number
  ribbonWidth: number
  ringWidth: number
  ringHeroWidth: number
  tunnelMinScale: number
  tunnelMaxScale: number
  finalHeroWidth: number
  finalMiddleWidth: number
  finalBackgroundWidth: number
}

function clamp(min: number, value: number, max: number) {
  return Math.max(min, Math.min(value, max))
}

/**
 * Every scene owns a different photographic scale. The numbers remain responsive,
 * while the limits prevent a 3:4 card from becoming either a thumbnail or a poster
 * that no longer fits the cinema stage.
 */
export function createSceneVisualScale(
  width: number,
  height: number,
  isMobile = width < 720,
): SceneVisualScale {
  if (isMobile) {
    return {
      wallWidth: clamp(72, width * 0.22, 92),
      ribbonWidth: clamp(88, height * 0.125, 112),
      ringWidth: clamp(78, width * 0.22, 96),
      ringHeroWidth: clamp(190, width * 0.58, 248),
      tunnelMinScale: 0.38,
      tunnelMaxScale: 1.52,
      finalHeroWidth: clamp(118, width * 0.34, 142),
      finalMiddleWidth: clamp(74, width * 0.22, 92),
      finalBackgroundWidth: clamp(42, width * 0.13, 58),
    }
  }

  return {
    wallWidth: clamp(125, width * 0.088, 175),
    ribbonWidth: clamp(160, height * 0.19, 220),
    ringWidth: clamp(138, width * 0.084, 172),
    ringHeroWidth: clamp(330, width * 0.22, 430),
    tunnelMinScale: 0.34,
    tunnelMaxScale: 2.08,
    finalHeroWidth: clamp(180, width * 0.115, 240),
    finalMiddleWidth: clamp(110, width * 0.072, 150),
    finalBackgroundWidth: clamp(70, width * 0.048, 105),
  }
}
