'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Effect } from '../../types';
import { getEffects, deleteEffect } from '../../lib/effects';
import { getUserId } from '../../lib/auth';
import EffectModal from '../../components/EffectModal';

export default function EffectsPage() {
  const [effects, setEffects] = useState<Effect[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEffect, setEditingEffect] = useState<Effect | null>(null);

  const loadEffects = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      const effectsData = await getEffects(userId);
      setEffects(effectsData);
    } catch (error) {
      console.error('エフェクター一覧の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEffects();
  }, []);

  const handleDelete = async (effect: Effect) => {
    if (!confirm(`「${effect.name}」を削除しますか？`)) return;

    try {
      const userId = getUserId();
      const success = await deleteEffect(effect.id, userId);
      if (success) {
        setEffects(effects.filter(e => e.id !== effect.id));
      } else {
        alert('削除に失敗しました');
      }
    } catch (error) {
      console.error('エフェクター削除に失敗しました:', error);
      alert('削除に失敗しました');
    }
  };

  const handleEdit = (effect: Effect) => {
    setEditingEffect(effect);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingEffect(null);
  };

  const handleEffectSaved = () => {
    loadEffects();
    handleModalClose();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">エフェクター一覧</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            新規追加
          </button>
        </div>

        {effects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 mb-4">エフェクターが登録されていません</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              最初のエフェクターを追加
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {effects.map((effect) => (
              <div key={effect.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{effect.name}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(effect)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="編集"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(effect)}
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
                    <span>{effect.width_mm}mm × {effect.height_mm}mm</span>
                  </div>
                  {effect.memo && (
                    <div>
                      <span className="block mb-1">メモ:</span>
                      <p className="text-gray-700 bg-gray-50 p-2 rounded text-xs leading-relaxed">
                        {effect.memo}
                      </p>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-3">
                    作成日: {new Date(effect.created_at).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <EffectModal
          effect={editingEffect}
          onClose={handleModalClose}
          onSave={handleEffectSaved}
        />
      )}
    </div>
  );
}