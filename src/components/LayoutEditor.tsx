'use client';

import { useState, useCallback } from 'react';
import { Save, ZoomIn, ZoomOut, Grid3x3 } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
} from '@dnd-kit/core';
import { Layout, Board, Effect, LayoutData, EffectPosition } from '../types';
import DroppableBoard from './DroppableBoard';
import DraggableEffect from './DraggableEffect';
import { snapToGridEnhanced } from '../lib/coordinates';

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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [gridSize, setGridSize] = useState<number>(5); // 1, 5, 10mm

  // @dnd-kit sensors setup
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

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

  // エフェクター回転ハンドラ
  const handleEffectRotate = useCallback((effectId: string) => {
    setCurrentLayoutData(prev => ({
      ...prev,
      effects: prev.effects.map(e => {
        if (e.effect_id === effectId) {
          const newRotation = ((e.rotation || 0) + 90) % 360;
          return { ...e, rotation: newRotation as 0 | 90 | 180 | 270 };
        }
        return e;
      })
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

  // @dnd-kit drag handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback(() => {
    // ドラッグオーバー処理（必要に応じて実装）
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event;
    setActiveId(null);

    if (!over) return;

    // パレットからボードへのドロップ
    if (active.data.current?.type === 'palette-effect' && over.id === 'board-canvas') {
      const effectId = active.id as string;
      handleAddEffect(effectId);
    }

    // ボード内でのエフェクター移動
    if (active.data.current?.type === 'placed-effect' && over.id === 'board-canvas') {
      const effectId = active.id as string;
      const currentPosition = active.data.current?.position;
      const effect = active.data.current?.effect;
      
      if (currentPosition && delta && effect) {
        // deltaを使用して新しい位置を計算（mm変換）
        const MM_TO_PX_RATIO = 0.8;
        const deltaXMm = delta.x / (MM_TO_PX_RATIO * scale);
        const deltaYMm = delta.y / (MM_TO_PX_RATIO * scale);
        
        let newX = currentPosition.x + deltaXMm;
        let newY = currentPosition.y + deltaYMm;
        
        // グリッドスナップを適用
        if (snapToGrid) {
          const snapped = snapToGridEnhanced(
            newX,
            newY,
            gridSize,
            { width: effect.width_mm, height: effect.height_mm },
            { width: board.width_mm, height: board.height_mm },
            currentPosition.rotation || 0
          );
          newX = snapped.x;
          newY = snapped.y;
        } else {
          // スナップなしの場合は手動境界チェック
          newX = Math.max(0, Math.min(
            board.width_mm - effect.width_mm, 
            newX
          ));
          newY = Math.max(0, Math.min(
            board.height_mm - effect.height_mm,
            newY
          ));
        }
        
        handleEffectPositionUpdate(effectId, newX, newY);
      }
    }
  }, [handleAddEffect, handleEffectPositionUpdate, board, scale, snapToGrid, gridSize]);

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
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
            
            <div className="ml-4 border-l border-gray-300 pl-4 flex items-center gap-2">
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
              
              {/* グリッドスナップ切替 */}
              <button
                onClick={() => setSnapToGrid(!snapToGrid)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  snapToGrid
                    ? 'bg-purple-100 text-purple-700 border border-purple-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                }`}
                title="グリッドスナップ切替"
              >
                スナップ
              </button>
              
              {/* グリッドサイズ選択 */}
              {snapToGrid && (
                <select
                  value={gridSize}
                  onChange={(e) => setGridSize(parseInt(e.target.value))}
                  className="text-xs border border-gray-300 rounded px-2 py-1"
                  title="グリッドサイズ"
                >
                  <option value={1}>1mm</option>
                  <option value={5}>5mm</option>
                  <option value={10}>10mm</option>
                </select>
              )}
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
                  <DraggableEffect
                    key={effect.id}
                    effect={effect}
                    isInPalette={true}
                  />
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
                    <DraggableEffect
                      key={effect.id}
                      effect={effect}
                      isInPalette={false}
                      position={effect.position}
                      onRemove={handleRemoveEffect}
                      onRotate={handleEffectRotate}
                    />
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
        <DroppableBoard
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

      {/* DragOverlay for visual feedback */}
      <DragOverlay>
        {activeId ? (
          <div className="bg-white border-2 border-purple-500 rounded-lg shadow-lg transform rotate-3 opacity-90">
            <DraggableEffect
              effect={effects.find(e => e.id === activeId)!}
              isInPalette={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}