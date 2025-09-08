'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Settings } from 'lucide-react';
import Link from 'next/link';
import { Layout, Board, Effect } from '../../../types';
import { getUserId } from '../../../lib/auth';
import LayoutEditor from '../../../components/LayoutEditor';
import { useToast } from '../../../components/Toast';

export default function EditLayoutPage() {
  const { addToast } = useToast();
  const params = useParams();
  const layoutId = params.id as string;
  
  const [layout, setLayout] = useState<Layout | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [effects, setEffects] = useState<Effect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // エフェクター一覧を再取得する関数
  const refreshEffects = useCallback(async () => {
    try {
      const userId = getUserId();
      const response = await fetch(`/api/effects?userId=${userId}`);
      if (response.ok) {
        const updatedEffects = await response.json();
        setEffects(updatedEffects);
      }
    } catch (error) {
      console.error('エフェクター更新エラー:', error);
    }
  }, []);

  // レイアウト・関連データ取得
  useEffect(() => {
    const loadLayoutData = async () => {
      try {
        setLoading(true);
        const userId = getUserId();
        
        // 並行してデータを取得
        const [layoutRes, boardsRes, effectsRes] = await Promise.all([
          fetch(`/api/layouts?userId=${userId}`),
          fetch(`/api/boards?userId=${userId}`),
          fetch(`/api/effects?userId=${userId}`)
        ]);

        if (!layoutRes.ok || !boardsRes.ok || !effectsRes.ok) {
          throw new Error('データの取得に失敗しました');
        }

        const [layouts, boards, effectsData] = await Promise.all([
          layoutRes.json(),
          boardsRes.json(),
          effectsRes.json()
        ]);

        // 指定されたレイアウトを探す
        const currentLayout = layouts.find((l: Layout) => l.id === layoutId);
        if (!currentLayout) {
          throw new Error('レイアウトが見つかりません');
        }

        // 対応するボードを探す
        const currentBoard = boards.find((b: Board) => b.id === currentLayout.board_id);
        if (!currentBoard) {
          throw new Error('ペダルボードが見つかりません');
        }

        setLayout(currentLayout);
        setBoard(currentBoard);
        setEffects(effectsData);
      } catch (error) {
        addToast('データ取得に失敗しました', 'error');
        setError(error instanceof Error ? error.message : 'データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (layoutId) {
      loadLayoutData();
    }
  }, [layoutId, addToast]);

  // レイアウト保存処理
  const handleSaveLayout = async (updatedLayout: Layout) => {
    try {
      const userId = getUserId();
      const response = await fetch(`/api/layouts/${layoutId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          name: updatedLayout.name,
          layoutData: updatedLayout.layout_data,
          signalChainMemo: updatedLayout.signal_chain_memo,
          generalMemo: updatedLayout.general_memo,
        }),
      });

      if (!response.ok) {
        throw new Error('レイアウトの保存に失敗しました');
      }

      const savedLayout = await response.json();
      setLayout(savedLayout);
      
      addToast('レイアウトを保存しました！', 'success');
    } catch {
      addToast('レイアウトの保存に失敗しました', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">レイアウトを読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <h2 className="text-xl font-semibold text-red-800 mb-4">エラーが発生しました</h2>
              <p className="text-red-600 mb-6">{error}</p>
              <Link
                href="/layouts"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                レイアウト一覧に戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!layout || !board) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">レイアウトまたはペダルボード情報が見つかりません</p>
            <Link
              href="/layouts"
              className="mt-4 inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              レイアウト一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/layouts"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                レイアウト一覧
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{layout.name}</h1>
                <p className="text-sm text-gray-600">
                  ペダルボード: {board.name} ({board.width_mm} × {board.height_mm} mm)
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings size={18} />
                設定
              </button>
            </div>
          </div>
        </div>

        {/* レイアウトエディタ */}
        <div className="bg-white rounded-lg shadow-lg">
          <LayoutEditor
            layout={layout}
            board={board}
            effects={effects}
            onSave={handleSaveLayout}
            onEffectsUpdate={refreshEffects}
          />
        </div>

        {/* レイアウト情報 */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {layout.signal_chain_memo && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">配線順メモ</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{layout.signal_chain_memo}</p>
            </div>
          )}
          
          {layout.general_memo && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">一般メモ</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{layout.general_memo}</p>
            </div>
          )}
        </div>

        {/* フッター情報 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            作成: {new Date(layout.created_at).toLocaleDateString('ja-JP')} | 
            更新: {new Date(layout.updated_at).toLocaleDateString('ja-JP')}
          </p>
          {layout.share_code && (
            <p className="mt-1">
              共有コード: <span className="font-mono font-medium">{layout.share_code}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}