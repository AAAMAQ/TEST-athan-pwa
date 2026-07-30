import { normalizeDegrees, signedAngleDegrees } from './androidCompassMath'

const DEFAULT_TIME_CONSTANT_MS = 380
const FAST_SAMPLE_MS = 90
const LARGE_JUMP_DEGREES = 42
const LARGE_JUMP_DAMPING = 0.12

export class CircularCompassFilter {
  private value: number | null = null
  private lastTimestamp = 0

  update(rawHeading: number, timestamp = performance.now()) {
    if (!Number.isFinite(rawHeading) || !Number.isFinite(timestamp)) return this.value

    const heading = normalizeDegrees(rawHeading)
    if (this.value === null || this.lastTimestamp === 0) {
      this.value = heading
      this.lastTimestamp = timestamp
      return this.value
    }

    const elapsed = Math.max(0, timestamp - this.lastTimestamp)
    this.lastTimestamp = timestamp
    let delta = signedAngleDegrees(heading - this.value)

    if (elapsed < FAST_SAMPLE_MS && Math.abs(delta) > LARGE_JUMP_DEGREES) {
      delta *= LARGE_JUMP_DAMPING
    }

    const smoothing = elapsed === 0
      ? 1
      : 1 - Math.exp(-elapsed / DEFAULT_TIME_CONSTANT_MS)
    this.value = normalizeDegrees(this.value + delta * smoothing)
    return this.value
  }

  reset() {
    this.value = null
    this.lastTimestamp = 0
  }
}
