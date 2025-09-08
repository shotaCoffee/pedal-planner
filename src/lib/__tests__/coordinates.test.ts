import { describe, it, expect } from 'vitest'
import { mmToPx, pxToMm, snapToGrid, checkBounds, calculateScale } from '@/lib/coordinates'

describe('coordinates utilities', () => {
  describe('mmToPx', () => {
    it('should convert millimeters to pixels with scale', () => {
      expect(mmToPx(100, 2)).toBe(200)
      expect(mmToPx(0, 2)).toBe(0)
      expect(mmToPx(50, 1.5)).toBe(75)
    })
  })

  describe('pxToMm', () => {
    it('should convert pixels to millimeters with scale', () => {
      expect(pxToMm(200, 2)).toBe(100)
      expect(pxToMm(0, 2)).toBe(0)
      expect(pxToMm(75, 1.5)).toBe(50)
    })
  })

  describe('calculateScale', () => {
    it('should calculate appropriate scale for container', () => {
      expect(calculateScale(600, 400)).toBeCloseTo(1.4, 1) // (600-40)/400
      expect(calculateScale(200, 400)).toBeCloseTo(0.4, 1) // (200-40)/400
    })

    it('should respect max scale limit', () => {
      expect(calculateScale(1000, 200, 2)).toBe(2) // clamped to maxScale
      expect(calculateScale(50, 200)).toBe(0.1) // clamped to minimum 0.1
    })
  })

  describe('snapToGrid', () => {
    it('should snap coordinates to grid', () => {
      expect(snapToGrid(23, 10)).toBe(20)
      expect(snapToGrid(27, 10)).toBe(30)
      expect(snapToGrid(25, 10)).toBe(30)
      expect(snapToGrid(0, 10)).toBe(0)
    })

    it('should handle different grid sizes', () => {
      expect(snapToGrid(23, 5)).toBe(25)
      expect(snapToGrid(23, 20)).toBe(20)
    })
  })

  describe('checkBounds', () => {
    it('should check if effect is within board bounds', () => {
      expect(checkBounds(50, 50, 30, 20, 200, 150)).toBe(true)
      expect(checkBounds(0, 0, 30, 20, 200, 150)).toBe(true)
      expect(checkBounds(170, 130, 30, 20, 200, 150)).toBe(true) // 170+30=200, 130+20=150
      expect(checkBounds(171, 50, 30, 20, 200, 150)).toBe(false) // exceeds width
      expect(checkBounds(50, 131, 30, 20, 200, 150)).toBe(false) // exceeds height
      expect(checkBounds(-1, 50, 30, 20, 200, 150)).toBe(false) // negative position
    })

    it('should handle rotation correctly', () => {
      // 30x20 effect rotated 90 degrees becomes 20x30
      expect(checkBounds(50, 50, 30, 20, 100, 100, 90)).toBe(true)
      expect(checkBounds(81, 50, 30, 20, 100, 100, 90)).toBe(false) // 81+20=101 > 100
      expect(checkBounds(50, 71, 30, 20, 100, 100, 90)).toBe(false) // 71+30=101 > 100
    })
  })
})