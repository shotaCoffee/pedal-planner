import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getUserId, regenerateUserId, clearUserId } from '@/lib/auth'

// LocalStorage mock
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
} as Storage

// Global window mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

describe('auth functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getUserId', () => {
    it('should return existing user ID from localStorage', () => {
      const existingUserId = 'existing-user-id-12345'
      localStorageMock.getItem.mockReturnValue(existingUserId)

      const result = getUserId()

      expect(localStorageMock.getItem).toHaveBeenCalledWith('pedalboard_user_id')
      expect(result).toBe(existingUserId)
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    it('should generate and save new user ID when none exists', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = getUserId()

      expect(localStorageMock.getItem).toHaveBeenCalledWith('pedalboard_user_id')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('pedalboard_user_id', result)
      expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })

    it('should return temp server ID when window is undefined (SSR)', () => {
      // SSRシミュレーション - windowを一時的に無効化
      const originalWindow = global.window
      // @ts-ignore
      global.window = undefined

      const result = getUserId()

      expect(result).toBe('temp-server-id')

      // windowを復元
      global.window = originalWindow
    })
  })

  describe('regenerateUserId', () => {
    it('should generate new user ID and save to localStorage', () => {
      const result = regenerateUserId()

      expect(localStorageMock.setItem).toHaveBeenCalledWith('pedalboard_user_id', result)
      expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })

    it('should return temp server ID when window is undefined (SSR)', () => {
      const originalWindow = global.window
      // @ts-ignore
      global.window = undefined

      const result = regenerateUserId()

      expect(result).toBe('temp-server-id')
      expect(localStorageMock.setItem).not.toHaveBeenCalled()

      global.window = originalWindow
    })

    it('should generate different ID each time', () => {
      const id1 = regenerateUserId()
      const id2 = regenerateUserId()

      expect(id1).not.toBe(id2)
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2)
    })
  })

  describe('clearUserId', () => {
    it('should remove user ID from localStorage', () => {
      clearUserId()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('pedalboard_user_id')
    })

    it('should do nothing when window is undefined (SSR)', () => {
      const originalWindow = global.window
      // @ts-ignore
      global.window = undefined

      clearUserId()

      expect(localStorageMock.removeItem).not.toHaveBeenCalled()

      global.window = originalWindow
    })
  })

  describe('UUID generation', () => {
    it('should generate valid UUID v4 format', () => {
      const userId = getUserId()
      
      // UUID v4のフォーマット確認
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      expect(userId).toMatch(uuidV4Regex)
      
      // 4th section should start with 4 (version)
      expect(userId.charAt(14)).toBe('4')
      
      // 5th section should start with 8, 9, a, or b (variant)
      expect(['8', '9', 'a', 'b']).toContain(userId.charAt(19))
    })

    it('should generate unique IDs', () => {
      // 複数の新しいIDを生成して重複がないことを確認
      const ids = new Set()
      for (let i = 0; i < 100; i++) {
        clearUserId()
        const id = getUserId()
        expect(ids.has(id)).toBe(false)
        ids.add(id)
      }
    })
  })
})