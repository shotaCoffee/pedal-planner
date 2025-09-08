'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Board } from '../../../types';
import { getUserId } from '../../../lib/auth';
import { useToast } from '../../../components/Toast';

export default function NewLayoutPage() {
  const { addToast } = useToast();
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [layoutName, setLayoutName] = useState<string>('');
  const [signalChainMemo, setSignalChainMemo] = useState<string>('');
  const [generalMemo, setGeneralMemo] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ペダルボード一覧取得
  useEffect(() => {
    const loadBoards = async () => {
      try {
        setLoading(true);
        const userId = getUserId();
        const response = await fetch(`/api/boards?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch boards');
        }
        const boardsData = await response.json();
        setBoards(boardsData);
      } catch (error) {
        addToast('ペダルボード取得に失敗しました', 'error');
        alert('ペダルボード取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadBoards();
  }, []);

  // レイアウト作成処理
  const handleCreateLayout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBoardId || !layoutName.trim()) {
      alert('ペダルボードとレイアウト名を選択・入力してください');
      return;
    }

    try {
      setSaving(true);
      const userId = getUserId();
      
      // 空のレイアウトデータで作成
      const layoutData = {
        effects: []
      };

      const response = await fetch('/api/layouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          boardId: selectedBoardId,
          name: layoutName.trim(),
          layoutData,
          signalChainMemo: signalChainMemo.trim() || undefined,
          generalMemo: generalMemo.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create layout');
      }

      const newLayout = await response.json();
      
      // レイアウト編集ページにリダイレクト
      router.push(`/layouts/${newLayout.id}`);
    } catch (error) {
      addToast('レイアウト作成に失敗しました', 'error');
      alert('レイアウト作成に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const selectedBoard = boards.find(board => board.id === selectedBoardId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link
            href="/layouts"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            レイアウト一覧に戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">新しいレイアウト作成</h1>
          <p className="text-gray-600 mt-2">ペダルボードを選択してレイアウトの基本情報を入力してください</p>
        </div>

        {/* ボードが登録されていない場合の警告 */}
        {boards.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="text-yellow-800 font-semibold mb-2">ペダルボードが登録されていません</h3>
            <p className="text-yellow-700 mb-4">
              レイアウトを作成するには、まずペダルボードを登録してください。
            </p>
            <Link
              href="/boards"
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ペダルボード管理へ
            </Link>
          </div>
        )}

        {boards.length > 0 && (
          <form onSubmit={handleCreateLayout} className="bg-white rounded-lg shadow p-8">
            <div className="space-y-6">
              {/* ペダルボード選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ペダルボード選択 *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {boards.map((board) => (
                    <div key={board.id}>
                      <input
                        type="radio"
                        id={`board-${board.id}`}
                        name="selectedBoard"
                        value={board.id}
                        checked={selectedBoardId === board.id}
                        onChange={(e) => setSelectedBoardId(e.target.value)}
                        className="sr-only"
                      />
                      <label
                        htmlFor={`board-${board.id}`}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          selectedBoardId === board.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <h3 className="font-semibold text-gray-900 mb-2">{board.name}</h3>
                        <p className="text-sm text-gray-600">
                          {board.width_mm} × {board.height_mm} mm
                        </p>
                        {board.memo && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                            {board.memo}
                          </p>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedBoard && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-800">
                      選択中: <strong>{selectedBoard.name}</strong> ({selectedBoard.width_mm} × {selectedBoard.height_mm} mm)
                    </p>
                  </div>
                )}
              </div>

              {/* レイアウト名 */}
              <div>
                <label htmlFor="layoutName" className="block text-sm font-medium text-gray-700 mb-2">
                  レイアウト名 *
                </label>
                <input
                  type="text"
                  id="layoutName"
                  value={layoutName}
                  onChange={(e) => setLayoutName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="例: メインセッティング、ライブ用レイアウト"
                  maxLength={100}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {layoutName.length}/100文字
                </p>
              </div>

              {/* 配線順メモ */}
              <div>
                <label htmlFor="signalChainMemo" className="block text-sm font-medium text-gray-700 mb-2">
                  配線順メモ（オプション）
                </label>
                <textarea
                  id="signalChainMemo"
                  value={signalChainMemo}
                  onChange={(e) => setSignalChainMemo(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  placeholder="例: ギター → チューナー → オーバードライブ → ディストーション → ..."
                  rows={3}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {signalChainMemo.length}/1000文字
                </p>
              </div>

              {/* 一般メモ */}
              <div>
                <label htmlFor="generalMemo" className="block text-sm font-medium text-gray-700 mb-2">
                  一般メモ（オプション）
                </label>
                <textarea
                  id="generalMemo"
                  value={generalMemo}
                  onChange={(e) => setGeneralMemo(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  placeholder="例: 使用する楽曲、設定値、注意点など"
                  rows={3}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {generalMemo.length}/1000文字
                </p>
              </div>

              {/* 送信ボタン */}
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={saving || !selectedBoardId || !layoutName.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Save size={20} />
                  {saving ? '作成中...' : 'レイアウトを作成してエディタを開く'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}