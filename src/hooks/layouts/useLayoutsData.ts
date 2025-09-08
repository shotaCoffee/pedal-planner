'use client';

import { useEffect, useState } from 'react';
import { Layout, Board } from '../../types';
import { getUserId } from '../../lib/auth';

export interface UseLayoutsDataReturn {
  layouts: Layout[];
  boards: Board[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useLayoutsData(): UseLayoutsDataReturn {
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = getUserId();
      
      const [layoutsRes, boardsRes] = await Promise.all([
        fetch(`/api/layouts?userId=${userId}`),
        fetch(`/api/boards?userId=${userId}`)
      ]);
      
      if (!layoutsRes.ok || !boardsRes.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const [layoutsData, boardsData] = await Promise.all([
        layoutsRes.json(),
        boardsRes.json()
      ]);
      
      setLayouts(layoutsData);
      setBoards(boardsData);
    } catch (err) {
      console.error('データの取得に失敗しました:', err);
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    layouts,
    boards,
    loading,
    error,
    refetch
  };
}