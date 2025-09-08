import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getLayouts,
  getLayout,
  createLayout,
  updateLayout,
  deleteLayout,
  getLayoutsByBoard,
  generateShareCode,
  getLayoutByShareCode
} from '@/lib/layouts'
import * as db from '@/lib/db'
import { createMockLayout } from '@/test/factories'

// PostgreSQL query result type
type QueryResult = {
  rows: unknown[]
  rowCount: number
}

// db.queryをモック化
vi.mock('@/lib/db', () => ({
  query: vi.fn()
}))

const mockQuery = vi.mocked(db.query)

describe('layouts functions', () => {
  const userId = 'test-user-id'
  const boardId = 'test-board-id'
  const layoutId = 'test-layout-id'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getLayouts', () => {
    it('should fetch layouts for a user', async () => {
      const mockLayouts = [
        createMockLayout({ user_id: userId }),
        createMockLayout({ user_id: userId })
      ]
      
      mockQuery.mockResolvedValue({ rows: mockLayouts, rowCount: mockLayouts.length } as QueryResult)

      const result = await getLayouts(userId)

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM layouts WHERE user_id = $1 ORDER BY updated_at DESC',
        [userId]
      )
      expect(result).toEqual(mockLayouts)
    })

    it('should return empty array when no layouts found', async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 } as QueryResult)

      const result = await getLayouts(userId)

      expect(result).toEqual([])
    })
  })

  describe('getLayout', () => {
    it('should fetch a specific layout for a user', async () => {
      const mockLayout = createMockLayout({ id: layoutId, user_id: userId })
      
      mockQuery.mockResolvedValue({ rows: [mockLayout], rowCount: 1 } as QueryResult)

      const result = await getLayout(layoutId, userId)

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM layouts WHERE id = $1 AND user_id = $2',
        [layoutId, userId]
      )
      expect(result).toEqual(mockLayout)
    })

    it('should return null when layout not found', async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 } as QueryResult)

      const result = await getLayout(layoutId, userId)

      expect(result).toBeNull()
    })
  })

  describe('createLayout', () => {
    it('should create a new layout', async () => {
      const layoutData = {
        effects: [
          { id: 'effect-1', x: 100, y: 50, rotation: 0 }
        ]
      }
      const name = 'Test Layout'
      const signalChainMemo = 'Signal chain memo'
      const generalMemo = 'General memo'

      const mockCreatedLayout = createMockLayout({
        user_id: userId,
        board_id: boardId,
        name,
        layout_data: layoutData,
        signal_chain_memo: signalChainMemo,
        general_memo: generalMemo
      })

      mockQuery.mockResolvedValue({ rows: [mockCreatedLayout], rowCount: 1 } as QueryResult)

      const result = await createLayout(
        userId,
        boardId,
        name,
        layoutData,
        signalChainMemo,
        generalMemo
      )

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO layouts'),
        [userId, boardId, name, JSON.stringify(layoutData), signalChainMemo, generalMemo]
      )
      expect(result).toEqual(mockCreatedLayout)
    })

    it('should create layout with optional parameters as null', async () => {
      const layoutData = { effects: [] }
      const name = 'Test Layout'

      const mockCreatedLayout = createMockLayout({
        user_id: userId,
        board_id: boardId,
        name,
        layout_data: layoutData
      })

      mockQuery.mockResolvedValue({ rows: [mockCreatedLayout], rowCount: 1 } as QueryResult)

      const result = await createLayout(userId, boardId, name, layoutData)

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO layouts'),
        [userId, boardId, name, JSON.stringify(layoutData), null, null]
      )
      expect(result).toEqual(mockCreatedLayout)
    })
  })

  describe('updateLayout', () => {
    it('should update an existing layout', async () => {
      const layoutData = {
        effects: [
          { id: 'effect-1', x: 200, y: 100, rotation: 90 }
        ]
      }
      const name = 'Updated Layout'
      const signalChainMemo = 'Updated signal chain'
      const generalMemo = 'Updated general memo'

      const mockUpdatedLayout = createMockLayout({
        id: layoutId,
        user_id: userId,
        name,
        layout_data: layoutData,
        signal_chain_memo: signalChainMemo,
        general_memo: generalMemo
      })

      mockQuery.mockResolvedValue({ rows: [mockUpdatedLayout], rowCount: 1 } as QueryResult)

      const result = await updateLayout(
        layoutId,
        userId,
        name,
        layoutData,
        signalChainMemo,
        generalMemo
      )

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE layouts'),
        [layoutId, userId, name, JSON.stringify(layoutData), signalChainMemo, generalMemo]
      )
      expect(result).toEqual(mockUpdatedLayout)
    })

    it('should return null when layout not found for update', async () => {
      const layoutData = { effects: [] }
      const name = 'Non-existent Layout'

      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 } as QueryResult)

      const result = await updateLayout(layoutId, userId, name, layoutData)

      expect(result).toBeNull()
    })
  })

  describe('deleteLayout', () => {
    it('should delete a layout and return true', async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 1 } as QueryResult)

      const result = await deleteLayout(layoutId, userId)

      expect(mockQuery).toHaveBeenCalledWith(
        'DELETE FROM layouts WHERE id = $1 AND user_id = $2',
        [layoutId, userId]
      )
      expect(result).toBe(true)
    })

    it('should return false when no layout was deleted', async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 } as QueryResult)

      const result = await deleteLayout(layoutId, userId)

      expect(result).toBe(false)
    })
  })

  describe('getLayoutsByBoard', () => {
    it('should fetch layouts for a specific board', async () => {
      const mockLayouts = [
        createMockLayout({ board_id: boardId, user_id: userId }),
        createMockLayout({ board_id: boardId, user_id: userId })
      ]

      mockQuery.mockResolvedValue({ rows: mockLayouts, rowCount: mockLayouts.length } as QueryResult)

      const result = await getLayoutsByBoard(boardId, userId)

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM layouts WHERE board_id = $1 AND user_id = $2 ORDER BY updated_at DESC',
        [boardId, userId]
      )
      expect(result).toEqual(mockLayouts)
    })
  })

  describe('generateShareCode', () => {
    it('should generate a share code for a layout', async () => {
      const shareCode = 'ABC12345'
      mockQuery.mockResolvedValue({ rows: [{ share_code: shareCode }], rowCount: 1 } as QueryResult)

      // Math.randomをモック
      vi.spyOn(Math, 'random').mockReturnValue(0.123456789)

      const result = await generateShareCode(layoutId, userId)

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE layouts'),
        expect.arrayContaining([layoutId, userId])
      )
      expect(result).toBe(shareCode)
    })

    it('should return null when layout not found for share code generation', async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 } as QueryResult)

      const result = await generateShareCode(layoutId, userId)

      expect(result).toBeNull()
    })
  })

  describe('getLayoutByShareCode', () => {
    it('should fetch layout by share code', async () => {
      const shareCode = 'ABC12345'
      const mockLayout = createMockLayout({ share_code: shareCode })

      mockQuery.mockResolvedValue({ rows: [mockLayout], rowCount: 1 } as QueryResult)

      const result = await getLayoutByShareCode(shareCode)

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM layouts WHERE share_code = $1',
        [shareCode]
      )
      expect(result).toEqual(mockLayout)
    })

    it('should return null when no layout found with share code', async () => {
      const shareCode = 'INVALID123'
      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 } as QueryResult)

      const result = await getLayoutByShareCode(shareCode)

      expect(result).toBeNull()
    })
  })
})