'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layout, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Layout as LayoutType } from '../../types';
import { useLayoutsData, useLayoutActions, useBoardLookup } from '../../hooks';

export default function LayoutsPage() {
  // カスタムフックでデータ取得
  const { layouts: initialLayouts, boards, loading } = useLayoutsData();
  
  // ローカル状態でlayoutsを管理（楽観的更新のため）
  const [layouts, setLayouts] = useState<LayoutType[]>([]);
  
  // 初期データ取得時にローカル状態を更新
  useEffect(() => {
    setLayouts(initialLayouts);
  }, [initialLayouts]);
  
  // フック経由でアクション実行
  const { deleteLayout: deleteLayoutAction, generateShareCode: generateShareCodeAction } = useLayoutActions({ 
    layouts, 
    setLayouts 
  });
  
  // Board名検索フック
  const { getBoardName } = useBoardLookup(boards);
  
  const handleDelete = async (layout: LayoutType) => {
    await deleteLayoutAction(layout);
  };

  const handleGenerateShareCode = async (layout: LayoutType) => {
    await generateShareCodeAction(layout);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
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
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">レイアウト一覧</h1>
            <p className="text-gray-600 mt-2">ペダルボードレイアウトの管理・編集</p>
          </div>
          <Link
            href="/layouts/new"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            新規作成
          </Link>
        </div>

        {/* ボードが登録されていない場合の警告 */}
        {boards.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-yellow-800">
              レイアウトを作成するには、まず
              <Link href="/boards" className="text-yellow-600 hover:underline font-semibold">
                ペダルボードを登録
              </Link>
              してください。
            </p>
          </div>
        )}

        {layouts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Layout className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 mb-4">レイアウトが作成されていません</p>
            {boards.length > 0 ? (
              <Link
                href="/layouts/new"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                最初のレイアウトを作成
              </Link>
            ) : (
              <Link
                href="/boards"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                まずはペダルボードを登録
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {layouts.map((layout) => (
              <div key={layout.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{layout.name}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleGenerateShareCode(layout)}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                      title="共有リンク生成"
                    >
                      <Share2 size={16} />
                    </button>
                    <Link
                      href={`/layouts/${layout.id}`}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="編集"
                    >
                      <Edit2 size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(layout)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="削除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <div>
                    <span className="font-medium text-gray-700">ペダルボード:</span>
                    <span className="ml-2">{getBoardName(layout.board_id)}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">エフェクター:</span>
                    <span className="ml-2">{layout.layout_data.effects.length}個配置</span>
                  </div>

                  {layout.share_code && (
                    <div className="bg-purple-50 p-2 rounded">
                      <span className="font-medium text-purple-700">共有コード:</span>
                      <span className="ml-2 font-mono text-purple-600">{layout.share_code}</span>
                    </div>
                  )}

                  {layout.signal_chain_memo && (
                    <div>
                      <span className="block mb-1 font-medium text-gray-700">配線順:</span>
                      <p className="text-gray-600 bg-gray-50 p-2 rounded text-xs leading-relaxed">
                        {layout.signal_chain_memo}
                      </p>
                    </div>
                  )}

                  {layout.general_memo && (
                    <div>
                      <span className="block mb-1 font-medium text-gray-700">メモ:</span>
                      <p className="text-gray-600 bg-gray-50 p-2 rounded text-xs leading-relaxed">
                        {layout.general_memo}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-4 pt-3 border-t">
                    <div>作成: {new Date(layout.created_at).toLocaleDateString('ja-JP')}</div>
                    <div>更新: {new Date(layout.updated_at).toLocaleDateString('ja-JP')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ナビゲーションリンク */}
        <div className="mt-12 text-center">
          <div className="inline-flex gap-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← ホームに戻る
            </Link>
            <Link
              href="/effects"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              エフェクター管理
            </Link>
            <Link
              href="/boards"
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              ペダルボード管理
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}