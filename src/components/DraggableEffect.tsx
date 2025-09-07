'use client';

import { useDraggable } from '@dnd-kit/core';
import { RotateCw } from 'lucide-react';
import { Effect, EffectPosition } from '../types';

interface DraggableEffectProps {
  effect: Effect;
  isInPalette: boolean;
  position?: EffectPosition;
  onRemove?: (effectId: string) => void;
  onRotate?: (effectId: string) => void;
}

export default function DraggableEffect({
  effect,
  isInPalette,
  position,
  onRemove,
  onRotate,
}: DraggableEffectProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: effect.id,
    data: {
      type: isInPalette ? 'palette-effect' : 'placed-effect',
      effect,
      position,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  if (isInPalette) {
    // パレット内のエフェクター表示
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`p-3 border border-gray-200 rounded-lg bg-white hover:border-purple-300 transition-colors cursor-grab active:cursor-grabbing ${
          isDragging ? 'opacity-50' : 'opacity-100'
        }`}
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
    );
  } else {
    // 配置済みエフェクターの表示（サイドパネル内）
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`p-3 border border-green-200 rounded-lg bg-green-50 hover:border-green-300 transition-colors cursor-grab active:cursor-grabbing ${
          isDragging ? 'opacity-50' : 'opacity-100'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h5 className="font-medium text-gray-900 mb-1">{effect.name}</h5>
            {position && (
              <p className="text-sm text-gray-600">
                位置: ({Math.round(position.x)}, {Math.round(position.y)})
                {position.rotation !== 0 && (
                  <span className="ml-2">回転: {position.rotation}°</span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onRotate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRotate(effect.id);
                }}
                className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                title="90°回転"
              >
                <RotateCw size={16} />
              </button>
            )}
            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(effect.id);
                }}
                className="text-red-600 hover:text-red-800 text-sm transition-colors"
              >
                削除
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}