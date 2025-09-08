import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/layouts/route'
import * as layoutsLib from '@/lib/layouts'
import { createMockLayout } from '@/test/factories'

// Mock the layouts library
vi.mock('@/lib/layouts', () => ({
  getLayouts: vi.fn(),
  createLayout: vi.fn(),
  deleteLayout: vi.fn()
}))

const mockGetLayouts = vi.mocked(layoutsLib.getLayouts)
const mockCreateLayout = vi.mocked(layoutsLib.createLayout)

describe('/api/layouts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should return layouts for a valid userId', async () => {
      const userId = 'test-user-id'
      const mockLayouts = [
        createMockLayout({ user_id: userId }),
        createMockLayout({ user_id: userId })
      ]

      mockGetLayouts.mockResolvedValue(mockLayouts)

      const request = new NextRequest('http://localhost:3000/api/layouts?userId=' + userId)
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockGetLayouts).toHaveBeenCalledWith(userId)

      const responseData = await response.json()
      expect(responseData).toEqual(mockLayouts)
    })

    it('should return 400 when userId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/layouts')
      const response = await GET(request)

      expect(response.status).toBe(400)
      expect(mockGetLayouts).not.toHaveBeenCalled()

      const responseData = await response.json()
      expect(responseData).toEqual({ error: 'userId is required' })
    })

    it('should return 400 when userId is empty string', async () => {
      const request = new NextRequest('http://localhost:3000/api/layouts?userId=')
      const response = await GET(request)

      expect(response.status).toBe(400)
      expect(mockGetLayouts).not.toHaveBeenCalled()

      const responseData = await response.json()
      expect(responseData).toEqual({ error: 'userId is required' })
    })

    it('should handle database errors', async () => {
      const userId = 'test-user-id'
      const dbError = new Error('Database connection failed')
      mockGetLayouts.mockRejectedValue(dbError)

      const request = new NextRequest('http://localhost:3000/api/layouts?userId=' + userId)

      await expect(GET(request)).rejects.toThrow('Failed to fetch layouts: Database connection failed')
    })
  })

  describe('POST', () => {
    it('should create a new layout with valid data', async () => {
      const requestData = {
        userId: 'test-user-id',
        boardId: 'test-board-id',
        name: 'Test Layout',
        layoutData: {
          effects: [
            { id: 'effect-1', x: 100, y: 50, rotation: 0 }
          ]
        },
        signalChainMemo: 'Test signal chain',
        generalMemo: 'Test general memo'
      }

      const mockCreatedLayout = createMockLayout(requestData)
      mockCreateLayout.mockResolvedValue(mockCreatedLayout)

      const request = new NextRequest('http://localhost:3000/api/layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
      expect(mockCreateLayout).toHaveBeenCalledWith(
        requestData.userId,
        requestData.boardId,
        requestData.name,
        requestData.layoutData,
        requestData.signalChainMemo,
        requestData.generalMemo
      )

      const responseData = await response.json()
      expect(responseData).toEqual(mockCreatedLayout)
    })

    it('should create layout with minimal required data', async () => {
      const requestData = {
        userId: 'test-user-id',
        boardId: 'test-board-id',
        name: 'Minimal Layout',
        layoutData: { effects: [] }
      }

      const mockCreatedLayout = createMockLayout(requestData)
      mockCreateLayout.mockResolvedValue(mockCreatedLayout)

      const request = new NextRequest('http://localhost:3000/api/layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
      expect(mockCreateLayout).toHaveBeenCalledWith(
        requestData.userId,
        requestData.boardId,
        requestData.name,
        requestData.layoutData,
        undefined,
        undefined
      )
    })

    it('should return 400 when userId is missing', async () => {
      const requestData = {
        boardId: 'test-board-id',
        name: 'Test Layout',
        layoutData: { effects: [] }
      }

      const request = new NextRequest('http://localhost:3000/api/layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(mockCreateLayout).not.toHaveBeenCalled()

      const responseData = await response.json()
      expect(responseData).toEqual({
        error: 'userId, boardId, name, and layoutData are required'
      })
    })

    it('should return 400 when boardId is missing', async () => {
      const requestData = {
        userId: 'test-user-id',
        name: 'Test Layout',
        layoutData: { effects: [] }
      }

      const request = new NextRequest('http://localhost:3000/api/layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should return 400 when name is missing', async () => {
      const requestData = {
        userId: 'test-user-id',
        boardId: 'test-board-id',
        layoutData: { effects: [] }
      }

      const request = new NextRequest('http://localhost:3000/api/layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should return 400 when layoutData is missing', async () => {
      const requestData = {
        userId: 'test-user-id',
        boardId: 'test-board-id',
        name: 'Test Layout'
      }

      const request = new NextRequest('http://localhost:3000/api/layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should handle invalid JSON body', async () => {
      const request = new NextRequest('http://localhost:3000/api/layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      })

      await expect(POST(request)).rejects.toThrow()
    })

    it('should handle database errors during creation', async () => {
      const requestData = {
        userId: 'test-user-id',
        boardId: 'test-board-id',
        name: 'Test Layout',
        layoutData: { effects: [] }
      }

      const dbError = new Error('Database constraint violation')
      mockCreateLayout.mockRejectedValue(dbError)

      const request = new NextRequest('http://localhost:3000/api/layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      await expect(POST(request)).rejects.toThrow('Failed to create layout: Database constraint violation')
    })
  })
})