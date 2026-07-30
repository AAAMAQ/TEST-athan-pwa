import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { requestPwaInstall } from './pwa'

beforeEach(() => {
  window.dispatchEvent(new Event('appinstalled'))
})

afterEach(() => {
  Reflect.deleteProperty(navigator, 'share')
})

describe('PWA installation prompt', () => {
  it('opens the real browser install prompt when the browser provides one', async () => {
    const prompt = vi.fn().mockResolvedValue(undefined)
    const event = new Event('beforeinstallprompt', { cancelable: true })
    Object.assign(event, {
      prompt,
      userChoice: Promise.resolve({ outcome: 'accepted' as const })
    })

    window.dispatchEvent(event)

    await expect(requestPwaInstall()).resolves.toBe('accepted')
    expect(prompt).toHaveBeenCalledOnce()
    expect(event.defaultPrevented).toBe(true)
  })

  it('does not pretend that the generic Share API is an install prompt', async () => {
    const share = vi.fn()
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: share
    })

    await expect(requestPwaInstall()).resolves.toBe('unavailable')
    expect(share).not.toHaveBeenCalled()
  })
})
