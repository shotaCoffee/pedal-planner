'use client';

import { useState, useCallback } from 'react';
import { Save, ZoomIn, ZoomOut, Grid3x3 } from 'lucide-react';
import { Layout, Board, Effect, LayoutData, EffectPosition } from '../types';
import BoardCanvas from './BoardCanvas';

interface LayoutEditorProps {
  layout: Layout;
  board: Board;
  effects: Effect[];
  onSave: (updatedLayout: Layout) => void;
}

export default function LayoutEditor({
  layout,
  board,
  effects,
  onSave,
}: LayoutEditorProps) {
  const [currentLayoutData, setCurrentLayoutData] = useState<LayoutData>(layout.layout_data);
  const [scale, setScale] = useState<number>(1.0);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [selectedEffectId, setSelectedEffectId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // エフェクター選択ハンドラ
  const handleEffectSelect = useCallback((effectId: string) => {
    setSelectedEffectId(effectId);
  }, []);

  // エフェクター配置ハンドラ（現在は中央配置のみ）
  const handleAddEffect = useCallback((effectId: string) => {
    const effect = effects.find(e => e.id === effectId);
    if (!effect) return;

    // 既に配置されているかチェック
    const alreadyPlaced = currentLayoutData.effects.find(e => e.effect_id === effectId);
    if (alreadyPlaced) {
      alert('このエフェクターは既に配置されています');
      return;
    }

    // 中央に配置（仮実装）
    const centerX = board.width_mm / 2 - effect.width_mm / 2;
    const centerY = board.height_mm / 2 - effect.height_mm / 2;

    const newEffectPosition: EffectPosition = {
      effect_id: effectId,
      x: Math.max(0, centerX),
      y: Math.max(0, centerY),
      rotation: 0,
    };

    setCurrentLayoutData(prev => ({
      ...prev,
      effects: [...prev.effects, newEffectPosition]
    }));
  }, [effects, board, currentLayoutData]);

  // エフェクター削除ハンドラ
  const handleRemoveEffect = useCallback((effectId: string) => {
    setCurrentLayoutData(prev => ({
      ...prev,
      effects: prev.effects.filter(e => e.effect_id !== effectId)
    }));
  }, []);

  // エフェクター位置更新ハンドラ
  const handleEffectPositionUpdate = useCallback((effectId: string, x: number, y: number) => {
    setCurrentLayoutData(prev => ({
      ...prev,
      effects: prev.effects.map(e => 
        e.effect_id === effectId 
          ? { ...e, x, y }
          : e
      )
    }));
  }, []);

  // ズーム操作
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.1, 2.0));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.1, 0.3));
  }, []);

  const handleZoomReset = useCallback(() => {
    setScale(1.0);
  }, []);

  // 保存処理
  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      const updatedLayout: Layout = {
        ...layout,
        layout_data: currentLayoutData,
        updated_at: new Date().toISOString(),
      };
      await onSave(updatedLayout);
    } catch (error) {
      console.error('保存エラー:', error);
    } finally {
      setSaving(false);
    }
  }, [layout, currentLayoutData, onSave]);

  // 配置済みエフェクターの情報取得
  const getPlacedEffects = useCallback(() => {
    return currentLayoutData.effects.map(pos => {
      const effect = effects.find(e => e.id === pos.effect_id);
      return effect ? { ...effect, position: pos } : null;
    }).filter(Boolean);
  }, [currentLayoutData.effects, effects]);

  // 未配置エフェクター取得
  const getAvailableEffects = useCallback(() => {
    const placedIds = currentLayoutData.effects.map(e => e.effect_id);
    return effects.filter(e => !placedIds.includes(e.id));
  }, [effects, currentLayoutData.effects]);

  const placedEffects = getPlacedEffects();
  const availableEffects = getAvailableEffects();

  return (
    <div className="h-full flex">
      {/* サイドパネル - エフェクター一覧 */}
      <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
        {/* ツールバー */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">レイアウトエディタ</h3>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save size={16} />
              {saving ? '保存中...' : '保存'}
            </button>
          </div>

          {/* ズーム・表示コントロール */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              title="縮小"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={handleZoomReset}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              title="100%に戻す"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              title="拡大"
            >
              <ZoomIn size={16} />
            </button>
            
            <div className="ml-4 border-l border-gray-300 pl-4">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded transition-colors ${
                  showGrid
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="グリッド表示切替"
              >
                <Grid3x3 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* エフェクター一覧 */}
        <div className="flex-1 overflow-y-auto">
          {/* 未配置エフェクター */}
          <div className="p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              利用可能なエフェクター ({availableEffects.length}個)
            </h4>
            {availableEffects.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                すべてのエフェクターが配置済みです
              </p>
            ) : (
              <div className="space-y-2">
                {availableEffects.map((effect) => (
                  <div
                    key={effect.id}
                    className="p-3 border border-gray-200 rounded-lg bg-white hover:border-purple-300 transition-colors cursor-pointer"
                    onClick={() => handleAddEffect(effect.id)}
                  >
                    <h5 className="font-medium text-gray-900 mb-1">{effect.name}</h5>
                    <p className="text-sm text-gray-500">
                      {effect.width_mm} × {effect.height_mm} mm
                    </p>
                    {effect.memo && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {effect.memo}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 配置済みエフェクター */}
          {placedEffects.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                配置済みエフェクター ({placedEffects.length}個)
              </h4>
              <div className="space-y-2">
                {placedEffects.map((effect) => {
                  if (!effect) return null;
                  return (
                    <div
                      key={effect.id}
                      className="p-3 border border-green-200 rounded-lg bg-green-50 hover:border-green-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 mb-1">{effect.name}</h5>
                          <p className="text-sm text-gray-600">
                            位置: ({Math.round(effect.position.x)}, {Math.round(effect.position.y)})
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveEffect(effect.id)}
                          className="text-red-600 hover:text-red-800 text-sm transition-colors"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ステータス */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="text-sm text-gray-600">
            <div className="flex justify-between">
              <span>ボードサイズ:</span>
              <span>{board.width_mm} × {board.height_mm} mm</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>配置済み:</span>
              <span>{placedEffects.length}/{effects.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* メインエリア - ボードキャンバス */}
      <div className="flex-1 bg-white">
        <BoardCanvas
          board={board}
          effects={placedEffects.filter(Boolean) as (Effect & { position: EffectPosition })[]}
          scale={scale}
          showGrid={showGrid}
          selectedEffectId={selectedEffectId}
          onEffectSelect={handleEffectSelect}
          onEffectPositionUpdate={handleEffectPositionUpdate}
        />
      </div>
    </div>
  );
}