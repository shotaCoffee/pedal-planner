'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Settings } from 'lucide-react';
import { Board } from '../../types';
import { getUserId } from '../../lib/auth';
import BoardModal from '../../components/BoardModal';
import { useToast } from '../../components/Toast';

export default function BoardsPage() {
  const { addToast } = useToast();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);

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
      addToast('ペダルボード一覧の取得に失敗しました', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  const handleDelete = async (board: Board) => {
    if (!confirm(`「${board.name}」を削除しますか？`)) return;

    try {
      const userId = getUserId();
      const response = await fetch('/api/boards', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: board.id, userId }),
      });

      if (response.ok) {
        setBoards(boards.filter(b => b.id !== board.id));
      } else {
        addToast('削除に失敗しました', 'error');
      }
    } catch (error) {
      addToast('削除に失敗しました', 'error');
    }
  };

  const handleEdit = (board: Board) => {
    setEditingBoard(board);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingBoard(null);
  };

  const handleBoardSaved = () => {
    loadBoards();
    handleModalClose();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ペダルボード一覧</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            新規追加
          </button>
        </div>

        {boards.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Settings className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 mb-6">ペダルボードが登録されていません</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              最初のペダルボードを追加
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <div key={board.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{board.name}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(board)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="編集"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(board)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="削除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>サイズ:</span>
                    <span>{board.width_mm}mm × {board.height_mm}mm</span>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-center text-xs text-green-700 mb-1">ペダルボード</div>
                    <div 
                      className="bg-green-200 border border-green-300 rounded mx-auto"
                      style={{
                        width: Math.min(board.width_mm / 4, 120) + 'px',
                        height: Math.min(board.height_mm / 4, 60) + 'px',
                        minWidth: '60px',
                        minHeight: '30px'
                      }}
                    ></div>
                    <div className="text-center text-xs text-green-600 mt-1">
                      {board.width_mm} × {board.height_mm} mm
                    </div>
                  </div>

                  {board.memo && (
                    <div>
                      <span className="block mb-1">メモ:</span>
                      <p className="text-gray-700 bg-gray-50 p-2 rounded text-xs leading-relaxed">
                        {board.memo}
                      </p>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-3">
                    作成日: {new Date(board.created_at).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <BoardModal
          board={editingBoard}
          onClose={handleModalClose}
          onSave={handleBoardSaved}
        />
      )}
    </div>
  );
}